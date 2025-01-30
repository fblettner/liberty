import { EConditionsOperator, EConditions, IConditionGroupNode, IConditionMapping, IConditions, IConditionsProps, IConditionTreeNode } from "@ly_types/lyConditions";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { QuerySource } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { ToolsQuery } from "@ly_services/lyQuery";
import { IContentValue } from "@ly_utils/commonUtils";
import { EApplications } from "@ly_types/lyApplications";

function convertArray(input: string[]): IConditionMapping[] {
    return input.map(item => {
        const [source, target] = item.split('=');
        return { SOURCE: source, TARGET: target };
    });
}

function findTargetBySource(mappings: IConditionMapping[], source: string): string | undefined {
    if (!mappings) return source;
    const mapping = mappings.find(mapping => mapping.SOURCE === source);
    return mapping ? mapping.TARGET : undefined;
}

async function CheckCondition(
    groups: IConditionGroupNode,
    props: IConditionsProps
): Promise<boolean> {
    let condition = false;
    let groupLogical: string | null = null;

    if (groups.items.length > 0) {
        for (const item of groups.items) {
            let check = false;

            if (item.children) {
                // Recursively call CheckCondition for nested groups
                check = await CheckCondition(
                    { items: item.children },
                    props
                );

            } else {
                // Directly check the conditions for params (leaf nodes)
                check = CheckConditionForParams(item.items, props);
            }

            // Combine conditions for each group
            if (groupLogical === null)
                condition = check
            else {
                if (groupLogical === 'AND')
                    condition = condition || check
                else
                    condition = condition && check
            }

            groupLogical = item.logical
        }
        return condition
    } else
        return false
}

function CheckConditionForParams(param: IConditions, props: IConditionsProps): boolean {
    const filterString = props.dynamic_params;
    let cdn_params: IConditionMapping[] = [];
    if (filterString) {
        cdn_params = convertArray(filterString.split(";"));
    }

    let condition = false
    let source: string = findTargetBySource(cdn_params, param[EConditions.dd_id]) ?? param[EConditions.dd_id];
    
    if (props.data.fields[source]) {
        switch (param[EConditions.operator]) {
            case EConditionsOperator.equal:
                if (String(props.data.fields[source].value) === String(param[EConditions.value]))
                    condition = false
                else
                    condition = true
                break;
            case EConditionsOperator.not_equal:
                if (String(props.data.fields[source].value) !== String(param[EConditions.value]))
                    condition = false
                else
                    condition = true
                break;
            case EConditionsOperator.not_empty:
                if (props.data.fields[source].value !== null && props.data.fields[source].value !== "")
                    condition = false
                else
                    condition = true
                break;
            case EConditionsOperator.empty:
                if (props.data.fields[source].value === null || props.data.fields[source].value === "")
                    condition = false
                else
                condition = true
                break;
            case EConditionsOperator.greater:
                if (props.data.fields[source].value as number > Number(param[EConditions.value]))
                    condition = false
                else
                condition = true
                break;
            case EConditionsOperator.less:
                if (props.data.fields[source].value as number < Number(param[EConditions.value]))
                    condition = false
                else
                condition = true
                break;
        }
    }

    return condition
}

export function getParentChildV2(arr: IConditions[], rootParentId: string = '0'): IConditionTreeNode[] {
    const parentChildMap = new Map<string, IConditions[]>();

    // Step 1: Build the parent-child map
    for (const obj of arr) {
        const parentKey = obj[EConditions.group]?.toString() as string;  // Ensure parentKey is a string
        if (!parentChildMap.has(parentKey)) {
            parentChildMap.set(parentKey, []);
        }
        parentChildMap.get(parentKey)!.push(obj);  // Add child to the parent's array
    }

    // Step 2: Recursively build the tree starting from rootParentId ('0')
    const buildTree = (parentKey: string): IConditionTreeNode[] => {
        const children = parentChildMap.get(parentKey.toString()) || [];  // Ensure consistent string comparison
        // Map through each child and build their subtree recursively
        return children.map(child => {
            const childNode: IConditionTreeNode = {
                items: child,
                logical: child[EConditions.logical] as string || null,
                children: buildTree(child[EConditions.params_id]?.toString() as string)  // Recursively build children
            };

            // If no children exist, delete the `children` property
            if (childNode.children && childNode.children.length === 0) {
                delete childNode.children;
            }

            return childNode;
        });
    };

    // Step 3: Start the tree construction with the root parent (as a string)
    return buildTree(rootParentId.toString());
}


export async function lyCheckConditions(props: IConditionsProps): Promise<boolean> {
    let filters: IFiltersProperties[] = [];

    filters.push({
        header: "",
        field: EConditions.id,
        value: props[EConditions.id],
        type: "number",
        operator: "=",
        defined: true,
        rules: null,
        disabled: false,
        values: "",
    });

    const params = await ToolsQuery.get({
        source: QuerySource.Framework,
        framework_pool: props.appsProperties[EApplications.pool],
        query: GlobalSettings.getFramework.conditions_params,
        sessionMode: props.appsProperties[EApplications.session],
        filters: filters,
        modulesProperties: props.modulesProperties,
        jwt_token: props.appsProperties[EApplications.jwt_token]
    });


    if (params.items.length > 0) {
        let tree = getParentChildV2(params.items)
           let condition = false;

        let logical: IContentValue = null;

        for (const param of tree) {
            const topLevelCondition = await CheckCondition(
                { items: [param] },
                props
            );

            // Combine conditions for each top-level group 
            if (logical === null)
                condition = topLevelCondition
            else {
                if (logical === 'AND')
                    condition = condition || topLevelCondition
                else
                    condition = condition && topLevelCondition
            }
            logical = param.items[EConditions.logical]
        }
        return condition;
    } else

        return false;

}