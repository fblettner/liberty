"""Auto-generated SQLAlchemy models."""

from sqlalchemy import BOOLEAN, INTEGER, TEXT, TIMESTAMP, VARCHAR, BIGINT, DATE, REAL, Column, Integer, String, ForeignKey, Boolean, DateTime, Float, Text, ForeignKeyConstraint, Index, UniqueConstraint
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class AlembicVersion(Base):
    __tablename__ = 'alembic_version'
    version_num = Column(VARCHAR(32), primary_key=True, nullable=False)


class LyActBranch(Base):
    __tablename__ = 'ly_act_branch'
    act_id = Column(INTEGER, primary_key=True, nullable=False)
    brc_id = Column(INTEGER, primary_key=True, nullable=False)
    brc_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    brc_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    brc_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["act_id"], ["ly_actions.act_id"], name="ly_act_evt_id_fkey", ondelete="CASCADE"),
    )
    lyactions_rel = relationship('ly_actions')


class LyActParams(Base):
    __tablename__ = 'ly_act_params'
    act_id = Column(INTEGER, primary_key=True, nullable=False)
    map_var = Column(VARCHAR(50), primary_key=True, nullable=False)
    map_dir = Column(VARCHAR(20), primary_key=False, nullable=True)
    map_display = Column(VARCHAR(1), primary_key=False, nullable=True)
    map_rules = Column(VARCHAR(10), primary_key=False, nullable=True)
    map_rules_values = Column(VARCHAR(50), primary_key=False, nullable=True)
    map_default = Column(VARCHAR(100), primary_key=False, nullable=True)
    map_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    map_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["act_id"], ["ly_actions.act_id"], name="ly_act_map_id_fkey", ondelete="CASCADE"),
    )
    lyactions_rel = relationship('ly_actions')


class LyActParamsFilters(Base):
    __tablename__ = 'ly_act_params_filters'
    act_id = Column(INTEGER, primary_key=True, nullable=False)
    map_var = Column(VARCHAR(50), primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["act_id", "map_var"], ["ly_act_params.act_id", "ly_act_params.map_var"], name="ly_act_params_filters_act_id_map_var_fkey", ondelete="CASCADE"),
    )
    lyactparams_rel = relationship('ly_act_params')


class LyActTasks(Base):
    __tablename__ = 'ly_act_tasks'
    act_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_seq = Column(INTEGER, primary_key=False, nullable=False)
    evt_type = Column(VARCHAR(20), primary_key=False, nullable=True)
    evt_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    evt_disabled = Column(VARCHAR(1), primary_key=False, nullable=True)
    evt_query_id = Column(INTEGER, primary_key=False, nullable=True)
    evt_query_crud = Column(VARCHAR(10), primary_key=False, nullable=True)
    evt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    evt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    evt_cdn_id = Column(INTEGER, primary_key=False, nullable=True)
    evt_brc_true = Column(INTEGER, primary_key=False, nullable=True)
    evt_brc_false = Column(INTEGER, primary_key=False, nullable=True)
    evt_brc_id = Column(INTEGER, primary_key=False, nullable=True)
    evt_api_id = Column(INTEGER, primary_key=False, nullable=True)
    evt_component = Column(VARCHAR(20), primary_key=False, nullable=True)
    evt_component_id = Column(INTEGER, primary_key=False, nullable=True)
    evt_loop = Column(VARCHAR(1), primary_key=False, nullable=True)
    evt_loop_array = Column(VARCHAR(50), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["act_id"], ["ly_actions.act_id"], name="ly_act_evt_id_fkey", ondelete="CASCADE"),
    )
    lyactions_rel = relationship('ly_actions')


class LyActTasksParams(Base):
    __tablename__ = 'ly_act_tasks_params'
    act_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_id = Column(INTEGER, primary_key=True, nullable=False)
    map_id = Column(INTEGER, primary_key=True, nullable=False)
    map_type = Column(VARCHAR(20), primary_key=False, nullable=False)
    map_dir = Column(VARCHAR(20), primary_key=False, nullable=True)
    map_var = Column(VARCHAR(50), primary_key=False, nullable=True)
    map_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    map_var_type = Column(VARCHAR(20), primary_key=False, nullable=True)
    map_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    map_rules = Column(VARCHAR(20), primary_key=False, nullable=True)
    map_rules_values = Column(VARCHAR(50), primary_key=False, nullable=True)
    map_default = Column(VARCHAR(100), primary_key=False, nullable=True)
    map_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    map_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["act_id", "evt_id"], ["ly_act_tasks.act_id", "ly_act_tasks.evt_id"], name="ly_act_taks_act_id_evt_id_fkey", ondelete="CASCADE"),
    )
    lyacttasks_rel = relationship('ly_act_tasks')


class LyActions(Base):
    __tablename__ = 'ly_actions'
    act_id = Column(INTEGER, primary_key=True, nullable=False)
    act_label = Column(VARCHAR(255), primary_key=False, nullable=True)
    act_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    act_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyApi(Base):
    __tablename__ = 'ly_api'
    api_id = Column(INTEGER, primary_key=True, nullable=False)
    api_label = Column(VARCHAR(100), primary_key=False, nullable=False)
    api_source = Column(VARCHAR(20), primary_key=False, nullable=True)
    api_method = Column(VARCHAR(20), primary_key=False, nullable=True)
    api_url = Column(VARCHAR(255), primary_key=False, nullable=False)
    api_user = Column(VARCHAR(100), primary_key=False, nullable=True)
    api_password = Column(TEXT, primary_key=False, nullable=True)
    api_body = Column(TEXT, primary_key=False, nullable=True)
    api_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    api_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyApiHeader(Base):
    __tablename__ = 'ly_api_header'
    api_id = Column(INTEGER, primary_key=True, nullable=False)
    hdr_id = Column(INTEGER, primary_key=True, nullable=False)
    hdr_key = Column(VARCHAR(100), primary_key=False, nullable=False)
    hdr_value = Column(VARCHAR(100), primary_key=False, nullable=False)
    hdr_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    hdr_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyApiParams(Base):
    __tablename__ = 'ly_api_params'
    api_id = Column(INTEGER, primary_key=True, nullable=False)
    map_id = Column(INTEGER, primary_key=True, nullable=False)
    map_var = Column(VARCHAR(100), primary_key=False, nullable=False)
    map_value = Column(VARCHAR(100), primary_key=False, nullable=False)
    map_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    map_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyApplications(Base):
    __tablename__ = 'ly_applications'
    apps_id = Column(INTEGER, primary_key=True, nullable=False)
    apps_name = Column(VARCHAR(40), primary_key=False, nullable=True)
    apps_description = Column(VARCHAR(100), primary_key=False, nullable=True)
    apps_version = Column(INTEGER, primary_key=False, nullable=True)
    apps_pool = Column(VARCHAR(50), primary_key=False, nullable=True)
    apps_pool_min = Column(INTEGER, primary_key=False, nullable=True)
    apps_pool_max = Column(INTEGER, primary_key=False, nullable=True)
    apps_dbtype = Column(VARCHAR(10), primary_key=False, nullable=True)
    apps_jdbc = Column(VARCHAR(500), primary_key=False, nullable=True)
    apps_user = Column(VARCHAR(20), primary_key=False, nullable=True)
    apps_password = Column(TEXT, primary_key=False, nullable=True)
    apps_host = Column(VARCHAR(100), primary_key=False, nullable=True)
    apps_port = Column(INTEGER, primary_key=False, nullable=True)
    apps_database = Column(VARCHAR(100), primary_key=False, nullable=True)
    apps_offset = Column(INTEGER, primary_key=False, nullable=True)
    apps_limit = Column(INTEGER, primary_key=False, nullable=True)
    apps_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    apps_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    apps_dashboard = Column(INTEGER, primary_key=False, nullable=True)
    apps_type = Column(VARCHAR(20), primary_key=False, nullable=True)
    apps_theme = Column(VARCHAR(20), primary_key=False, nullable=True)
    apps_replace_null = Column(VARCHAR(1), primary_key=False, nullable=True)


class LyCdnGrp(Base):
    __tablename__ = 'ly_cdn_grp'
    cdn_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_group = Column(INTEGER, primary_key=True, nullable=False)
    cdn_label = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_logical = Column(VARCHAR(20), primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["cdn_id"], ["ly_condition.cdn_id"], name="lycdngrp_fk1", ondelete="CASCADE"),
    )
    lycondition_rel = relationship('ly_condition')


class LyCdnParams(Base):
    __tablename__ = 'ly_cdn_params'
    cdn_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_params_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_seq = Column(INTEGER, primary_key=False, nullable=False)
    cdn_dd_id = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_operator = Column(VARCHAR(20), primary_key=False, nullable=True)
    cdn_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_enum_id = Column(INTEGER, primary_key=False, nullable=True)
    cdn_lookup_id = Column(INTEGER, primary_key=False, nullable=True)
    cdn_logical = Column(VARCHAR(20), primary_key=False, nullable=True)
    cdn_group = Column(INTEGER, primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    cdn_type = Column(VARCHAR(20), primary_key=False, nullable=True)
    cdn_grp_label = Column(VARCHAR(50), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["cdn_id"], ["ly_condition.cdn_id"], name="llycdnval_fk1", ondelete="CASCADE"),
    )
    lycondition_rel = relationship('ly_condition')


class LyCharts(Base):
    __tablename__ = 'ly_charts'
    crt_id = Column(INTEGER, primary_key=True, nullable=False)
    crt_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    crt_type = Column(VARCHAR(20), primary_key=False, nullable=True)
    crt_grid_hz = Column(VARCHAR(1), primary_key=False, nullable=True)
    crt_grid_vt = Column(VARCHAR(1), primary_key=False, nullable=True)
    crt_axis_x = Column(VARCHAR(50), primary_key=False, nullable=True)
    crt_axis_y1 = Column(VARCHAR(50), primary_key=False, nullable=True)
    crt_axis_y2 = Column(VARCHAR(50), primary_key=False, nullable=True)
    crt_query_id = Column(INTEGER, primary_key=False, nullable=True)
    crt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    crt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyComponents(Base):
    __tablename__ = 'ly_components'
    cpt_name = Column(VARCHAR(20), primary_key=True, nullable=False)
    cpt_description = Column(VARCHAR(100), primary_key=False, nullable=True)
    cpt_enabled = Column(VARCHAR(1), primary_key=False, nullable=True)
    cpt_usage = Column(TEXT, primary_key=False, nullable=True)
    cpt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cpt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyCondition(Base):
    __tablename__ = 'ly_condition'
    cdn_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyCtxFilters(Base):
    __tablename__ = 'ly_ctx_filters'
    ctx_id = Column(INTEGER, primary_key=True, nullable=False)
    val_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["val_id", "ctx_id"], ["ly_ctx_val.val_id", "ly_ctx_val.ctx_id"], name="ly_ctx_filters_val_id_ctx_id_fkey", ondelete="CASCADE"),
    )
    lyctxval_rel = relationship('ly_ctx_val')


class LyCtxVal(Base):
    __tablename__ = 'ly_ctx_val'
    ctx_id = Column(INTEGER, primary_key=True, nullable=False)
    val_id = Column(INTEGER, primary_key=True, nullable=False)
    val_seq = Column(INTEGER, primary_key=False, nullable=True)
    val_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    val_component = Column(VARCHAR(40), primary_key=False, nullable=True)
    val_component_id = Column(INTEGER, primary_key=False, nullable=True)
    val_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    val_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["ctx_id"], ["ly_ctxmenus.ctx_id"], name="ly_ctx_val_ctx_id_fkey", ondelete="CASCADE"),
    )
    lyctxmenus_rel = relationship('ly_ctxmenus')


class LyCtxValL(Base):
    __tablename__ = 'ly_ctx_val_l'
    ctx_id = Column(INTEGER, primary_key=True, nullable=False)
    val_id = Column(INTEGER, primary_key=True, nullable=False)
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["ctx_id", "val_id"], ["ly_ctx_val.ctx_id", "ly_ctx_val.val_id"], name="ly_ctx_val_l_ctx_id_val_id_fkey", ondelete="CASCADE"),
    )
    lyctxval_rel = relationship('ly_ctx_val')


class LyCtxmenus(Base):
    __tablename__ = 'ly_ctxmenus'
    ctx_id = Column(INTEGER, primary_key=True, nullable=False)
    ctx_description = Column(VARCHAR(50), primary_key=False, nullable=True)
    ctx_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    ctx_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyDashboard(Base):
    __tablename__ = 'ly_dashboard'
    dsh_id = Column(INTEGER, primary_key=True, nullable=False)
    dsh_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    dsh_row = Column(INTEGER, primary_key=False, nullable=True)
    dsh_column = Column(INTEGER, primary_key=False, nullable=True)
    dsh_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    dsh_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyDbSchema(Base):
    __tablename__ = 'ly_db_schema'
    sch_id = Column(INTEGER, primary_key=True, nullable=False)
    sch_pool = Column(VARCHAR(50), primary_key=False, nullable=True)
    sch_name = Column(VARCHAR(30), primary_key=False, nullable=True)
    sch_target = Column(VARCHAR(30), primary_key=False, nullable=True)
    sch_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    sch_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyDialogs(Base):
    __tablename__ = 'ly_dialogs'
    dlg_id = Column(INTEGER, primary_key=True, nullable=False)
    dlg_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    dlg_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    dlg_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyDictionary(Base):
    __tablename__ = 'ly_dictionary'
    dd_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    dd_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    dd_type = Column(VARCHAR(40), primary_key=False, nullable=True)
    dd_rules = Column(VARCHAR(20), primary_key=False, nullable=True)
    dd_rules_values = Column(VARCHAR(50), primary_key=False, nullable=True)
    dd_default = Column(VARCHAR(50), primary_key=False, nullable=True)
    dd_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    dd_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyDictionaryFilters(Base):
    __tablename__ = 'ly_dictionary_filters'
    dd_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["dd_id"], ["ly_dictionary.dd_id"], name="ly_dictionary_filters_d_id_fkey", ondelete="CASCADE"),
    )
    lydictionary_rel = relationship('ly_dictionary')


class LyDictionaryL(Base):
    __tablename__ = 'ly_dictionary_l'
    dd_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["dd_id"], ["ly_dictionary.dd_id"], name="ly_dictionary_l_dd_id_fkey", ondelete="CASCADE"),
    )
    lydictionary_rel = relationship('ly_dictionary')


class LyDlgCol(Base):
    __tablename__ = 'ly_dlg_col'
    frm_id = Column(INTEGER, primary_key=True, nullable=False)
    col_id = Column(INTEGER, primary_key=True, nullable=False)
    tab_id = Column(INTEGER, primary_key=False, nullable=False)
    col_seq = Column(INTEGER, primary_key=False, nullable=True)
    col_colspan = Column(INTEGER, primary_key=False, nullable=True)
    col_component = Column(VARCHAR(20), primary_key=False, nullable=False)
    col_component_id = Column(INTEGER, primary_key=False, nullable=True)
    col_dd_id = Column(VARCHAR(50), primary_key=False, nullable=True)
    col_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    col_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    col_type = Column(VARCHAR(20), primary_key=False, nullable=True)
    col_rules = Column(VARCHAR(20), primary_key=False, nullable=True)
    col_rules_values = Column(VARCHAR(50), primary_key=False, nullable=True)
    col_default = Column(VARCHAR(50), primary_key=False, nullable=True)
    col_visible = Column(VARCHAR(1), primary_key=False, nullable=True)
    col_disabled = Column(VARCHAR(1), primary_key=False, nullable=True)
    col_required = Column(VARCHAR(1), primary_key=False, nullable=True)
    col_key = Column(VARCHAR(1), primary_key=False, nullable=True)
    col_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    col_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    col_cdn_id = Column(INTEGER, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["frm_id"], ["ly_dlg_frm.frm_id"], name="ly_dlg_col_frm_id_fkey", ondelete="CASCADE"),
    )
    lydlgfrm_rel = relationship('ly_dlg_frm')


class LyDlgColCdn(Base):
    __tablename__ = 'ly_dlg_col_cdn'
    frm_id = Column(INTEGER, primary_key=True, nullable=False)
    col_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    cdn_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    cdn_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["frm_id", "col_id"], ["ly_dlg_col.frm_id", "ly_dlg_col.col_id"], name="lydlgcolcdn_fk1", ondelete="CASCADE"),
    )
    lydlgcol_rel = relationship('ly_dlg_col')


class LyDlgFilters(Base):
    __tablename__ = 'ly_dlg_filters'
    frm_id = Column(INTEGER, primary_key=True, nullable=False)
    col_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["col_id", "frm_id"], ["ly_dlg_col.col_id", "ly_dlg_col.frm_id"], name="ly_dlg_filters_col_id_frm_id_fkey", ondelete="CASCADE"),
    )
    lydlgcol_rel = relationship('ly_dlg_col')


class LyDlgFrm(Base):
    __tablename__ = 'ly_dlg_frm'
    dlg_id = Column(INTEGER, primary_key=False, nullable=False)
    frm_id = Column(INTEGER, primary_key=True, nullable=False)
    frm_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    frm_query_id = Column(INTEGER, primary_key=False, nullable=True)
    frm_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    frm_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["dlg_id"], ["ly_dialogs.dlg_id"], name="ly_dlg_frm_dlg_id_fkey", ondelete="CASCADE"),
    )
    lydialogs_rel = relationship('ly_dialogs')


class LyDlgTab(Base):
    __tablename__ = 'ly_dlg_tab'
    frm_id = Column(INTEGER, primary_key=True, nullable=False)
    tab_id = Column(INTEGER, primary_key=True, nullable=False)
    tab_seq = Column(INTEGER, primary_key=False, nullable=True)
    tab_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    tab_cdn_id = Column(INTEGER, primary_key=False, nullable=True)
    tab_cols = Column(INTEGER, primary_key=False, nullable=True)
    tab_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    tab_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    tab_disable_add = Column(VARCHAR(1), primary_key=False, nullable=True)
    tab_disable_edit = Column(VARCHAR(1), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["frm_id"], ["ly_dlg_frm.frm_id"], name="lydlgtab_fk1", ondelete="CASCADE"),
    )
    lydlgfrm_rel = relationship('ly_dlg_frm')


class LyDlgTabCdn(Base):
    __tablename__ = 'ly_dlg_tab_cdn'
    frm_id = Column(INTEGER, primary_key=True, nullable=False)
    tab_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    cdn_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    cdn_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["frm_id", "tab_id"], ["ly_dlg_tab.frm_id", "ly_dlg_tab.tab_id"], name="ly_dlg_tab_cdn_frm_id_tab_id_fkey", ondelete="CASCADE"),
    )
    lydlgtab_rel = relationship('ly_dlg_tab')


class LyDlgTabL(Base):
    __tablename__ = 'ly_dlg_tab_l'
    frm_id = Column(INTEGER, primary_key=True, nullable=False)
    tab_id = Column(INTEGER, primary_key=True, nullable=False)
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["frm_id", "tab_id"], ["ly_dlg_tab.frm_id", "ly_dlg_tab.tab_id"], name="ly_dlg_tab_l_frm_id_tab_id_fkey", ondelete="CASCADE"),
    )
    lydlgtab_rel = relationship('ly_dlg_tab')


class LyDshCol(Base):
    __tablename__ = 'ly_dsh_col'
    dsh_id = Column(INTEGER, primary_key=True, nullable=False)
    dsh_col_id = Column(INTEGER, primary_key=True, nullable=False)
    dsh_display_title = Column(VARCHAR(1), primary_key=False, nullable=True)
    dsh_title = Column(VARCHAR(50), primary_key=False, nullable=True)
    dsh_row = Column(INTEGER, primary_key=False, nullable=True)
    dsh_column = Column(INTEGER, primary_key=False, nullable=True)
    dsh_component = Column(VARCHAR(20), primary_key=False, nullable=True)
    dsh_component_id = Column(INTEGER, primary_key=False, nullable=True)
    dsh_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    dsh_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["dsh_id"], ["ly_dashboard.dsh_id"], name="ly_dsh_col_dsh_id_fkey", ondelete="CASCADE"),
    )
    lydashboard_rel = relationship('ly_dashboard')


class LyEnum(Base):
    __tablename__ = 'ly_enum'
    enum_id = Column(INTEGER, primary_key=True, nullable=False)
    enum_label = Column(VARCHAR(40), primary_key=False, nullable=False)
    enum_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    enum_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    enum_display_add = Column(VARCHAR(1), primary_key=False, nullable=True)


class LyEnumVal(Base):
    __tablename__ = 'ly_enum_val'
    enum_id = Column(INTEGER, primary_key=True, nullable=False)
    val_enum = Column(VARCHAR(20), primary_key=True, nullable=False)
    val_label = Column(VARCHAR(200), primary_key=False, nullable=True)
    val_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    val_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["enum_id"], ["ly_enum.enum_id"], name="ly_enum_val_enum_id_fkey", ondelete="CASCADE"),
    )
    lyenum_rel = relationship('ly_enum')


class LyEnumValL(Base):
    __tablename__ = 'ly_enum_val_l'
    enum_id = Column(INTEGER, primary_key=True, nullable=False)
    val_enum = Column(VARCHAR(20), primary_key=True, nullable=False)
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(200), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["enum_id", "val_enum"], ["ly_enum_val.enum_id", "ly_enum_val.val_enum"], name="ly_enum_val_l_enum_id_val_id_fkey", ondelete="CASCADE"),
    )
    lyenumval_rel = relationship('ly_enum_val')


class LyEvents(Base):
    __tablename__ = 'ly_events'
    evt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_component = Column(VARCHAR(20), primary_key=False, nullable=False)
    evt_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    evt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    evt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyEvtCpt(Base):
    __tablename__ = 'ly_evt_cpt'
    evt_component = Column(VARCHAR(20), primary_key=True, nullable=False)
    evt_cpt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_col_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_seq_id = Column(INTEGER, primary_key=False, nullable=False)
    evt_act_id = Column(INTEGER, primary_key=False, nullable=False)
    evt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    evt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyEvtDd(Base):
    __tablename__ = 'ly_evt_dd'
    evt_component = Column(VARCHAR(20), primary_key=True, nullable=False)
    evt_cpt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_dd_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    evt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_act_id = Column(INTEGER, primary_key=False, nullable=False)
    evt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    evt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyFunction(Base):
    __tablename__ = 'ly_function'
    fct_id = Column(INTEGER, primary_key=True, nullable=False)
    fct_name = Column(VARCHAR(100), primary_key=False, nullable=False)
    fct_label = Column(VARCHAR(255), primary_key=False, nullable=True)
    fct_script = Column(TEXT, primary_key=False, nullable=True)
    fct_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    fct_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyLanguage(Base):
    __tablename__ = 'ly_language'
    lng_id = Column(VARCHAR(5), primary_key=True, nullable=False)
    lng_name = Column(VARCHAR(20), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyLinks(Base):
    __tablename__ = 'ly_links'
    lnk_id = Column(INTEGER, primary_key=True, nullable=False)
    lnk_component = Column(VARCHAR(20), primary_key=False, nullable=False)
    lnk_component_id = Column(INTEGER, primary_key=False, nullable=True)
    lnk_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lnk_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyLkpParams(Base):
    __tablename__ = 'ly_lkp_params'
    lkp_id = Column(INTEGER, primary_key=True, nullable=False)
    dd_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    lkp_dir = Column(VARCHAR(20), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["lkp_id"], ["ly_lookup.lkp_id"], name="ly_lkp_params_lkp_id_fkey", ondelete="CASCADE"),
    )
    lylookup_rel = relationship('ly_lookup')


class LyLnkVal(Base):
    __tablename__ = 'ly_lnk_val'
    lnk_id = Column(INTEGER, primary_key=True, nullable=False)
    val_id = Column(INTEGER, primary_key=True, nullable=False)
    val_sequence = Column(INTEGER, primary_key=False, nullable=False)
    val_label = Column(VARCHAR(40), primary_key=False, nullable=True)
    val_link = Column(VARCHAR(250), primary_key=False, nullable=True)
    val_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    val_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["lnk_id"], ["ly_links.lnk_id"], name="ly_lnk_val_lnk_id_fkey", ondelete="CASCADE"),
    )
    lylinks_rel = relationship('ly_links')


class LyLnkValL(Base):
    __tablename__ = 'ly_lnk_val_l'
    lnk_id = Column(INTEGER, primary_key=True, nullable=False)
    val_id = Column(INTEGER, primary_key=True, nullable=False)
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(40), primary_key=False, nullable=True)
    lng_link = Column(VARCHAR(250), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["lnk_id", "val_id"], ["ly_lnk_val.lnk_id", "ly_lnk_val.val_id"], name="ly_lnk_val_l_lnk_id_val_id_fkey", ondelete="CASCADE"),
    )
    lylnkval_rel = relationship('ly_lnk_val')


class LyLookup(Base):
    __tablename__ = 'ly_lookup'
    lkp_id = Column(INTEGER, primary_key=True, nullable=False)
    lkp_description = Column(VARCHAR(50), primary_key=False, nullable=True)
    lkp_query_id = Column(INTEGER, primary_key=False, nullable=True)
    lkp_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lkp_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    lkp_display_add = Column(VARCHAR(1), primary_key=False, nullable=True)
    lkp_frm_id = Column(INTEGER, primary_key=False, nullable=True)
    lkp_dd_id = Column(VARCHAR(50), primary_key=False, nullable=True)
    lkp_dd_label = Column(VARCHAR(50), primary_key=False, nullable=True)
    lkp_dd_group = Column(VARCHAR(50), primary_key=False, nullable=True)
    lkp_display_search = Column(VARCHAR(1), primary_key=False, nullable=True)
    lkp_tbl_id = Column(INTEGER, primary_key=False, nullable=True)


class LyMenus(Base):
    __tablename__ = 'ly_menus'
    menu_seq_ukid = Column(VARCHAR(150), primary_key=True, nullable=False)
    menu_parent_id = Column(VARCHAR(40), primary_key=False, nullable=True)
    menu_child_id = Column(VARCHAR(40), primary_key=False, nullable=True)
    menu_component = Column(VARCHAR(40), primary_key=False, nullable=True)
    menu_component_id = Column(INTEGER, primary_key=False, nullable=True)
    menu_label = Column(VARCHAR(50), primary_key=False, nullable=True)
    menu_level = Column(INTEGER, primary_key=False, nullable=True)
    menu_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    menu_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyMenusFilters(Base):
    __tablename__ = 'ly_menus_filters'
    menu_seq_ukid = Column(VARCHAR(150), primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["menu_seq_ukid"], ["ly_menus.menu_seq_ukid"], name="ly_menu_filters_menu_seq_ukid_fkey", ondelete="CASCADE"),
    )
    lymenus_rel = relationship('ly_menus')


class LyMenusL(Base):
    __tablename__ = 'ly_menus_l'
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_seq_ukid = Column(VARCHAR(150), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(50), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["lng_seq_ukid"], ["ly_menus.menu_seq_ukid"], name="ly_menus_l_lng_seq_ukid_fkey", ondelete="CASCADE"),
    )
    lymenus_rel = relationship('ly_menus')


class LyModules(Base):
    __tablename__ = 'ly_modules'
    module_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    module_description = Column(VARCHAR(100), primary_key=False, nullable=True)
    module_enabled = Column(VARCHAR(1), primary_key=False, nullable=True)
    module_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    module_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    module_params = Column(TEXT, primary_key=False, nullable=True)


class LyNextnum(Base):
    __tablename__ = 'ly_nextnum'
    nn_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    nn_current = Column(INTEGER, primary_key=False, nullable=True)
    nn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    nn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyQryFmw(Base):
    __tablename__ = 'ly_qry_fmw'
    fmw_id = Column(INTEGER, primary_key=True, nullable=False)
    fmw_dbtype = Column(VARCHAR(10), primary_key=True, nullable=False)
    fmw_crud = Column(VARCHAR(10), primary_key=True, nullable=False)
    fmw_description = Column(VARCHAR(100), primary_key=False, nullable=True)
    fmw_pool = Column(VARCHAR(10), primary_key=False, nullable=False)
    fmw_sqlquery = Column(TEXT, primary_key=False, nullable=True)
    fmw_orderby = Column(VARCHAR(100), primary_key=False, nullable=True)
    fmw_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    fmw_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyQrySql(Base):
    __tablename__ = 'ly_qry_sql'
    query_id = Column(INTEGER, primary_key=True, nullable=False)
    query_dbtype = Column(VARCHAR(10), primary_key=True, nullable=False)
    query_crud = Column(VARCHAR(10), primary_key=True, nullable=False)
    query_pool = Column(VARCHAR(10), primary_key=False, nullable=False)
    query_sqlquery = Column(TEXT, primary_key=False, nullable=True)
    query_orderby = Column(VARCHAR(100), primary_key=False, nullable=True)
    query_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    query_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["query_id"], ["ly_query.query_id"], name="ly_qry_sql_query_id_fkey", ondelete="CASCADE"),
    )
    lyquery_rel = relationship('ly_query')


class LyQuery(Base):
    __tablename__ = 'ly_query'
    query_id = Column(INTEGER, primary_key=True, nullable=False)
    query_label = Column(VARCHAR(100), primary_key=False, nullable=False)
    query_type = Column(VARCHAR(20), primary_key=False, nullable=False)
    query_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    query_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyRolAuth(Base):
    __tablename__ = 'ly_rol_auth'
    rol_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    aut_id = Column(INTEGER, primary_key=True, nullable=False)
    aut_component = Column(VARCHAR(40), primary_key=False, nullable=True)
    aut_component_id = Column(INTEGER, primary_key=False, nullable=True)
    aut_dd_id = Column(VARCHAR(50), primary_key=False, nullable=True)
    aut_menu_seq_ukid = Column(VARCHAR(150), primary_key=False, nullable=True)
    aut_run = Column(VARCHAR(1), primary_key=False, nullable=True)
    aut_add = Column(VARCHAR(1), primary_key=False, nullable=True)
    aut_chg = Column(VARCHAR(1), primary_key=False, nullable=True)
    aut_del = Column(VARCHAR(1), primary_key=False, nullable=True)
    aut_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    aut_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["rol_id"], ["ly_roles.rol_id"], name="lyrolauth_fk1", ondelete="CASCADE"),
    )
    lyroles_rel = relationship('ly_roles')


class LyRoles(Base):
    __tablename__ = 'ly_roles'
    rol_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    rol_name = Column(VARCHAR(255), primary_key=False, nullable=True)
    rol_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    rol_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LySeqParams(Base):
    __tablename__ = 'ly_seq_params'
    seq_id = Column(INTEGER, primary_key=True, nullable=False)
    dd_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["seq_id"], ["ly_sequence.seq_id"], name="ly_seq_params_seq_id_fkey", ondelete="CASCADE"),
    )
    lysequence_rel = relationship('ly_sequence')


class LySequence(Base):
    __tablename__ = 'ly_sequence'
    seq_id = Column(INTEGER, primary_key=True, nullable=False)
    seq_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    seq_query_id = Column(INTEGER, primary_key=False, nullable=True)
    seq_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    seq_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    seq_dd_id = Column(VARCHAR(50), primary_key=False, nullable=True)


class LyTables(Base):
    __tablename__ = 'ly_tables'
    tbl_id = Column(INTEGER, primary_key=True, nullable=False)
    tbl_db_name = Column(VARCHAR(50), primary_key=False, nullable=True)
    tbl_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    tbl_query_id = Column(INTEGER, primary_key=False, nullable=True)
    tbl_editable = Column(VARCHAR(1), primary_key=False, nullable=True)
    tbl_uploadable = Column(VARCHAR(1), primary_key=False, nullable=True)
    tbl_audit = Column(VARCHAR(1), primary_key=False, nullable=True)
    tbl_burst = Column(VARCHAR(1), primary_key=False, nullable=True)
    tbl_workbook = Column(VARCHAR(50), primary_key=False, nullable=True)
    tbl_sheet = Column(VARCHAR(50), primary_key=False, nullable=True)
    tbl_ctx_id = Column(INTEGER, primary_key=False, nullable=True)
    tbl_tree_id = Column(INTEGER, primary_key=False, nullable=True)
    tbl_frm_id = Column(INTEGER, primary_key=False, nullable=True)
    tbl_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    tbl_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    tbl_auto_load = Column(VARCHAR(1), primary_key=False, nullable=True)


class LyTblCol(Base):
    __tablename__ = 'ly_tbl_col'
    tbl_id = Column(INTEGER, primary_key=True, nullable=False)
    col_id = Column(INTEGER, primary_key=True, nullable=False)
    col_seq = Column(INTEGER, primary_key=False, nullable=True)
    col_dd_id = Column(VARCHAR(50), primary_key=False, nullable=True)
    col_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    col_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    col_type = Column(VARCHAR(20), primary_key=False, nullable=True)
    col_rules = Column(VARCHAR(20), primary_key=False, nullable=True)
    col_rules_values = Column(VARCHAR(50), primary_key=False, nullable=True)
    col_default = Column(VARCHAR(50), primary_key=False, nullable=True)
    col_visible = Column(VARCHAR(1), primary_key=False, nullable=True)
    col_disabled = Column(VARCHAR(1), primary_key=False, nullable=True)
    col_required = Column(VARCHAR(1), primary_key=False, nullable=True)
    col_key = Column(VARCHAR(1), primary_key=False, nullable=True)
    col_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    col_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    col_filter = Column(VARCHAR(1), primary_key=False, nullable=True)
    col_cdn_id = Column(INTEGER, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["tbl_id"], ["ly_tables.tbl_id"], name="ly_tbl_col_tbl_id_fkey", ondelete="CASCADE"),
    )
    lytables_rel = relationship('ly_tables')


class LyTblColCdn(Base):
    __tablename__ = 'ly_tbl_col_cdn'
    tbl_id = Column(INTEGER, primary_key=True, nullable=False)
    col_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    cdn_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    cdn_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["tbl_id", "col_id"], ["ly_tbl_col.tbl_id", "ly_tbl_col.col_id"], name="lytblcolcdn_fk1", ondelete="CASCADE"),
    )
    lytblcol_rel = relationship('ly_tbl_col')


class LyTblFilters(Base):
    __tablename__ = 'ly_tbl_filters'
    tbl_id = Column(INTEGER, primary_key=True, nullable=False)
    col_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["tbl_id", "col_id"], ["ly_tbl_col.tbl_id", "ly_tbl_col.col_id"], name="ly_tbl_filters_col_id_tbl_id_fkey", ondelete="CASCADE"),
    )
    lytblcol_rel = relationship('ly_tbl_col')


class LyThemes(Base):
    __tablename__ = 'ly_themes'
    thm_id = Column(INTEGER, primary_key=True, nullable=False)
    thm_name = Column(VARCHAR(50), primary_key=False, nullable=False)
    thm_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    thm_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        UniqueConstraint("thm_name", name="ly_themes_thm_name_key"),
    )



class LyThmColors(Base):
    __tablename__ = 'ly_thm_colors'
    thm_id = Column(INTEGER, primary_key=True, nullable=False)
    tcl_id = Column(INTEGER, primary_key=True, nullable=False)
    tcl_key = Column(VARCHAR(50), primary_key=False, nullable=False)
    tcl_light = Column(VARCHAR(100), primary_key=False, nullable=False)
    tcl_dark = Column(VARCHAR(100), primary_key=False, nullable=False)
    tcl_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    tcl_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["thm_id"], ["ly_themes.thm_id"], name="ly_thm_colors_thm_id_fkey", ondelete="CASCADE"),
    )
    lythemes_rel = relationship('ly_themes')


class LyTree(Base):
    __tablename__ = 'ly_tree'
    tree_id = Column(INTEGER, primary_key=True, nullable=False)
    tree_description = Column(VARCHAR(100), primary_key=False, nullable=True)
    tree_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    tree_parent = Column(VARCHAR(100), primary_key=False, nullable=True)
    tree_child = Column(VARCHAR(100), primary_key=False, nullable=True)
    tree_key = Column(VARCHAR(100), primary_key=False, nullable=True)
    tree_group = Column(VARCHAR(100), primary_key=False, nullable=True)
    tree_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    tree_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    tree_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LyUsers(Base):
    __tablename__ = 'ly_users'
    usr_id = Column(VARCHAR(100), primary_key=True, nullable=False)
    usr_password = Column(TEXT, primary_key=False, nullable=True)
    usr_name = Column(VARCHAR(255), primary_key=False, nullable=True)
    usr_email = Column(VARCHAR(255), primary_key=False, nullable=True)
    usr_status = Column(VARCHAR(1), primary_key=False, nullable=True)
    usr_admin = Column(VARCHAR(1), primary_key=False, nullable=True)
    usr_language = Column(VARCHAR(3), primary_key=False, nullable=True)
    usr_mode = Column(VARCHAR(10), primary_key=False, nullable=True)
    usr_readonly = Column(VARCHAR(1), primary_key=False, nullable=True)
    usr_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    usr_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    usr_dashboard = Column(INTEGER, primary_key=False, nullable=True)
    usr_theme = Column(VARCHAR(20), primary_key=False, nullable=True)


class LyUsrRoles(Base):
    __tablename__ = 'ly_usr_roles'
    usr_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    rol_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    rlu_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    rlu_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["usr_id"], ["ly_users.usr_id"], name="lyusrroles_fk1", ondelete="CASCADE"),
        ForeignKeyConstraint(["rol_id"], ["ly_roles.rol_id"], name="lyusrroles_fk2", ondelete="CASCADE"),
    )
    lyusers_rel = relationship('ly_users')
    lyroles_rel = relationship('ly_roles')


