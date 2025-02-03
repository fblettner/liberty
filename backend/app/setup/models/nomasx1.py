"""Auto-generated SQLAlchemy models."""

from sqlalchemy import BOOLEAN, INTEGER, TEXT, TIMESTAMP, VARCHAR, BIGINT, DATE, REAL, Column, Integer, String, ForeignKey, Boolean, DateTime, Float, Text, ForeignKeyConstraint, Index, UniqueConstraint
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class AlembicVersion(Base):
    __tablename__ = 'alembic_version'
    version_num = Column(VARCHAR(32), primary_key=True, nullable=False)


class AuditTrail(Base):
    __tablename__ = 'audit_trail'
    aud_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    aud_dt_transaction = Column(DATE, primary_key=True, nullable=False)
    aud_operation = Column(VARCHAR(30), primary_key=True, nullable=False)
    aud_seg_owner = Column(VARCHAR(386), primary_key=True, nullable=False)
    aud_seg_name = Column(VARCHAR(286), primary_key=True, nullable=False)
    aud_user = Column(VARCHAR(50), primary_key=True, nullable=False)
    aud_count = Column(INTEGER, primary_key=False, nullable=True)


class AuditTrailQuery(Base):
    __tablename__ = 'audit_trail_query'
    aud_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    aud_row_id = Column(INTEGER, primary_key=True, nullable=False)
    aud_scn = Column(BIGINT, primary_key=False, nullable=False)
    aud_dt_transaction = Column(TIMESTAMP, primary_key=False, nullable=False)
    aud_operation = Column(VARCHAR(30), primary_key=False, nullable=False)
    aud_seg_owner = Column(VARCHAR(386), primary_key=False, nullable=False)
    aud_seg_name = Column(VARCHAR(286), primary_key=False, nullable=False)
    aud_seg_type = Column(VARCHAR(32), primary_key=False, nullable=False)
    aud_sql = Column(TEXT, primary_key=False, nullable=True)
    aud_undo = Column(TEXT, primary_key=False, nullable=True)
    aud_username = Column(VARCHAR(384), primary_key=False, nullable=True)


class AuditTrailValues(Base):
    __tablename__ = 'audit_trail_values'
    aud_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    aud_row_id = Column(INTEGER, primary_key=True, nullable=False)
    aud_val_id = Column(INTEGER, primary_key=True, nullable=False)
    aud_type = Column(VARCHAR(30), primary_key=True, nullable=False)
    aud_name = Column(VARCHAR(50), primary_key=False, nullable=False)
    aud_value = Column(TEXT, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["aud_apps_id", "aud_row_id"], ["audit_trail_query.aud_apps_id", "audit_trail_query.aud_row_id"], name="audittrailvalues_fk1", ondelete="CASCADE"),
    )
    audittrailquery_rel = relationship('audit_trail_query')


class DbOraFeatures(Base):
    __tablename__ = 'db_ora_features'
    oraf_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    oraf_inst_id = Column(INTEGER, primary_key=True, nullable=False)
    oraf_feature = Column(VARCHAR(255), primary_key=True, nullable=False)
    oraf_usage = Column(INTEGER, primary_key=False, nullable=True)
    oraf_first_usage = Column(DATE, primary_key=False, nullable=True)
    oraf_last_usage = Column(DATE, primary_key=False, nullable=True)
    oraf_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    oraf_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    oraf_ukid = Column(INTEGER, primary_key=False, nullable=True)


class DbOraFeaturesDollar(Base):
    __tablename__ = 'db_ora_features$'
    oraf_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    oraf_inst_id = Column(INTEGER, primary_key=True, nullable=False)
    oraf_feature = Column(VARCHAR(255), primary_key=True, nullable=False)
    oraf_usage = Column(INTEGER, primary_key=False, nullable=True)
    oraf_first_usage = Column(DATE, primary_key=False, nullable=True)
    oraf_last_usage = Column(DATE, primary_key=False, nullable=True)
    oraf_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    oraf_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    oraf_ukid = Column(INTEGER, primary_key=True, nullable=False)


class DbOraLicenses(Base):
    __tablename__ = 'db_ora_licenses'
    oral_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    oral_component = Column(VARCHAR(255), primary_key=True, nullable=False)
    oral_used = Column(VARCHAR(1), primary_key=False, nullable=True)
    oral_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    oral_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    oral_ukid = Column(INTEGER, primary_key=False, nullable=True)


class DbOraLicensesDollar(Base):
    __tablename__ = 'db_ora_licenses$'
    oral_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    oral_component = Column(VARCHAR(255), primary_key=True, nullable=False)
    oral_used = Column(VARCHAR(1), primary_key=False, nullable=True)
    oral_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    oral_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    oral_ukid = Column(INTEGER, primary_key=True, nullable=False)


class DbOraOptions(Base):
    __tablename__ = 'db_ora_options'
    orao_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    orao_inst_id = Column(INTEGER, primary_key=True, nullable=False)
    orao_parameter = Column(VARCHAR(255), primary_key=True, nullable=False)
    orao_value = Column(VARCHAR(1), primary_key=False, nullable=True)
    orao_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    orao_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    orao_ukid = Column(INTEGER, primary_key=False, nullable=True)


class DbOraOptionsDollar(Base):
    __tablename__ = 'db_ora_options$'
    orao_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    orao_inst_id = Column(INTEGER, primary_key=True, nullable=False)
    orao_parameter = Column(VARCHAR(255), primary_key=True, nullable=False)
    orao_value = Column(VARCHAR(1), primary_key=False, nullable=True)
    orao_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    orao_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    orao_ukid = Column(INTEGER, primary_key=True, nullable=False)


class DbOraPartitions(Base):
    __tablename__ = 'db_ora_partitions'
    opar_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    opar_owner = Column(VARCHAR(255), primary_key=True, nullable=False)
    opar_segment_type = Column(VARCHAR(255), primary_key=True, nullable=False)
    opar_segment_name = Column(VARCHAR(255), primary_key=True, nullable=False)
    opar_min_created = Column(DATE, primary_key=False, nullable=True)
    opar_min_last_ddl = Column(DATE, primary_key=False, nullable=True)
    opar_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    opar_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    opar_ukid = Column(INTEGER, primary_key=False, nullable=True)


class DbOraPartitionsDollar(Base):
    __tablename__ = 'db_ora_partitions$'
    opar_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    opar_owner = Column(VARCHAR(255), primary_key=True, nullable=False)
    opar_segment_type = Column(VARCHAR(255), primary_key=True, nullable=False)
    opar_segment_name = Column(VARCHAR(255), primary_key=True, nullable=False)
    opar_min_created = Column(DATE, primary_key=False, nullable=True)
    opar_min_last_ddl = Column(DATE, primary_key=False, nullable=True)
    opar_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    opar_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    opar_ukid = Column(INTEGER, primary_key=True, nullable=False)


class DbOraProperties(Base):
    __tablename__ = 'db_ora_properties'
    orap_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    orap_dbid = Column(INTEGER, primary_key=False, nullable=True)
    orap_product = Column(VARCHAR(255), primary_key=False, nullable=True)
    orap_full_version = Column(VARCHAR(20), primary_key=False, nullable=True)
    orap_version = Column(INTEGER, primary_key=False, nullable=True)
    orap_hostname = Column(VARCHAR(60), primary_key=False, nullable=True)
    orap_name = Column(VARCHAR(30), primary_key=False, nullable=True)
    orap_count_inst = Column(INTEGER, primary_key=False, nullable=True)
    orap_cpu = Column(INTEGER, primary_key=False, nullable=True)
    orap_active_users = Column(INTEGER, primary_key=False, nullable=True)
    orap_total_users = Column(INTEGER, primary_key=False, nullable=True)
    orap_dg = Column(VARCHAR(1), primary_key=False, nullable=True)
    orap_pack = Column(VARCHAR(30), primary_key=False, nullable=True)
    orap_size_gb = Column(INTEGER, primary_key=False, nullable=True)
    orap_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    orap_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    orap_ukid = Column(INTEGER, primary_key=False, nullable=True)


class DbOraPropertiesDollar(Base):
    __tablename__ = 'db_ora_properties$'
    orap_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    orap_dbid = Column(INTEGER, primary_key=False, nullable=True)
    orap_product = Column(VARCHAR(255), primary_key=False, nullable=True)
    orap_full_version = Column(VARCHAR(20), primary_key=False, nullable=True)
    orap_version = Column(INTEGER, primary_key=False, nullable=True)
    orap_hostname = Column(VARCHAR(60), primary_key=False, nullable=True)
    orap_name = Column(VARCHAR(30), primary_key=False, nullable=True)
    orap_count_inst = Column(INTEGER, primary_key=False, nullable=True)
    orap_cpu = Column(INTEGER, primary_key=False, nullable=True)
    orap_active_users = Column(INTEGER, primary_key=False, nullable=True)
    orap_total_users = Column(INTEGER, primary_key=False, nullable=True)
    orap_dg = Column(VARCHAR(1), primary_key=False, nullable=True)
    orap_pack = Column(VARCHAR(30), primary_key=False, nullable=True)
    orap_size_gb = Column(INTEGER, primary_key=False, nullable=True)
    orap_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    orap_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    orap_ukid = Column(INTEGER, primary_key=True, nullable=False)


class DbOraPropertiesTmp(Base):
    __tablename__ = 'db_ora_properties_tmp'
    orap_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    orap_dbid = Column(INTEGER, primary_key=False, nullable=True)
    orap_product = Column(VARCHAR(255), primary_key=False, nullable=True)
    orap_full_version = Column(VARCHAR(20), primary_key=False, nullable=True)
    orap_version = Column(INTEGER, primary_key=False, nullable=True)
    orap_hostname = Column(VARCHAR(60), primary_key=False, nullable=True)
    orap_name = Column(VARCHAR(30), primary_key=False, nullable=True)
    orap_count_inst = Column(INTEGER, primary_key=False, nullable=True)
    orap_cpu = Column(INTEGER, primary_key=False, nullable=True)
    orap_active_users = Column(INTEGER, primary_key=False, nullable=True)
    orap_total_users = Column(INTEGER, primary_key=False, nullable=True)
    orap_dg = Column(VARCHAR(1), primary_key=False, nullable=True)
    orap_pack = Column(VARCHAR(30), primary_key=False, nullable=True)
    orap_size_gb = Column(INTEGER, primary_key=False, nullable=True)
    orap_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    orap_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    orap_ukid = Column(INTEGER, primary_key=False, nullable=True)


class IDollarLicenseJdeOut(Base):
    __tablename__ = 'i$_license_jde_out'
    lout_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    lout_object = Column(VARCHAR(10), primary_key=True, nullable=False)
    lout_version = Column(VARCHAR(10), primary_key=True, nullable=False)
    lout_user = Column(VARCHAR(40), primary_key=True, nullable=False)
    lout_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    lout_usage = Column(DATE, primary_key=False, nullable=False)


class IDollarRolSecurityRights(Base):
    __tablename__ = 'i$_rol_security_rights'
    ser_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    ser_root_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    ser_role_id = Column(VARCHAR(30), primary_key=False, nullable=False)
    old_ser_role_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    ser_user_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    ser_menu_sequkid = Column(VARCHAR(150), primary_key=True, nullable=False)
    ser_role_action_id = Column(VARCHAR(30), primary_key=False, nullable=True)
    ser_object = Column(VARCHAR(50), primary_key=True, nullable=False)
    serl_form = Column(VARCHAR(30), primary_key=False, nullable=True)
    ser_version = Column(VARCHAR(30), primary_key=True, nullable=False)
    ser_run = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_add = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_chg = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_del = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_refresh = Column(DATE, primary_key=False, nullable=True)
    ser_ukid = Column(INTEGER, primary_key=False, nullable=True)


class IDollarSecurityActivityLog(Base):
    __tablename__ = 'i$_security_activity_log'
    acl_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    acl_user_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    acl_schema = Column(VARCHAR(30), primary_key=True, nullable=False)
    acl_table_name = Column(VARCHAR(30), primary_key=True, nullable=False)
    acl_dt_transaction = Column(DATE, primary_key=True, nullable=False)
    acl_count = Column(INTEGER, primary_key=False, nullable=True)
    acl_object_id = Column(VARCHAR(50), primary_key=True, nullable=False)


class IDollarSecurityRights(Base):
    __tablename__ = 'i$_security_rights'
    ser_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    ser_root_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    ser_role_id = Column(VARCHAR(30), primary_key=False, nullable=False)
    old_ser_role_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    ser_user_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    ser_menu_sequkid = Column(VARCHAR(150), primary_key=True, nullable=False)
    ser_role_action_id = Column(VARCHAR(30), primary_key=False, nullable=True)
    ser_object = Column(VARCHAR(50), primary_key=True, nullable=False)
    serl_form = Column(VARCHAR(30), primary_key=False, nullable=True)
    ser_version = Column(VARCHAR(30), primary_key=True, nullable=False)
    ser_run = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_add = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_chg = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_del = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_refresh = Column(DATE, primary_key=False, nullable=True)
    ser_ukid = Column(INTEGER, primary_key=False, nullable=True)
    __table_args__ = (
        Index("i$_security_rights_idx1", "ser_apps_id", "ser_menu_sequkid"),
        Index("i$_security_rights_idx2", "ser_apps_id", "ser_user_id", "ser_run"),
    )



class JdeMenus(Base):
    __tablename__ = 'jde_menus'
    jdem_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    jdem_root_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    jdem_parent_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    jdem_child_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    jdem_seq = Column(INTEGER, primary_key=True, nullable=False)
    jdem_ukid = Column(INTEGER, primary_key=False, nullable=True)


class JdeObjects(Base):
    __tablename__ = 'jde_objects'
    jdeo_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    jdeo_object = Column(VARCHAR(10), primary_key=True, nullable=False)
    jdeo_description = Column(VARCHAR(60), primary_key=False, nullable=True)
    jdeo_sy = Column(VARCHAR(10), primary_key=False, nullable=True)
    jdeo_type = Column(VARCHAR(4), primary_key=False, nullable=True)
    jdeo_ukid = Column(INTEGER, primary_key=False, nullable=True)


class JdeObjectsVersions(Base):
    __tablename__ = 'jde_objects_versions'
    jdeo_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    jdeo_object = Column(VARCHAR(10), primary_key=True, nullable=False)
    jdeo_version = Column(VARCHAR(10), primary_key=True, nullable=False)
    jdeo_description = Column(VARCHAR(60), primary_key=False, nullable=True)
    jdeo_sy = Column(VARCHAR(4), primary_key=False, nullable=True)
    jdeo_type = Column(VARCHAR(4), primary_key=False, nullable=True)
    jdeo_ukid = Column(INTEGER, primary_key=False, nullable=True)


class JdeSecMenus(Base):
    __tablename__ = 'jde_sec_menus'
    jder_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    jder_root_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    jder_parent_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    jder_child_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    jder_role_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    jder_enabled = Column(VARCHAR(1), primary_key=False, nullable=True)
    jder_ukid = Column(INTEGER, primary_key=False, nullable=True)


class JdeSecObjects(Base):
    __tablename__ = 'jde_sec_objects'
    jdeso_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    jdeso_type = Column(VARCHAR(10), primary_key=True, nullable=False)
    jdeso_role_user_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    jdeso_object = Column(VARCHAR(40), primary_key=True, nullable=False)
    jdeso_form = Column(VARCHAR(40), primary_key=True, nullable=False)
    jdeso_version = Column(VARCHAR(40), primary_key=True, nullable=False)
    jdeso_run = Column(VARCHAR(1), primary_key=False, nullable=True)
    jdeso_add = Column(VARCHAR(1), primary_key=False, nullable=True)
    jdeso_chg = Column(VARCHAR(1), primary_key=False, nullable=True)
    jdeso_del = Column(VARCHAR(1), primary_key=False, nullable=True)
    jdeso_ukid = Column(INTEGER, primary_key=False, nullable=True)
    __table_args__ = (
        Index("jde_sec_objects_idx1", "jdeso_apps_id", "jdeso_type", "jdeso_role_user_id", "jdeso_object"),
    )



class JdeTasks(Base):
    __tablename__ = 'jde_tasks'
    jdet_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    jdet_language = Column(VARCHAR(4), primary_key=True, nullable=False)
    jdet_task_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    jdet_task_name = Column(VARCHAR(40), primary_key=False, nullable=True)
    jdet_task_description = Column(VARCHAR(100), primary_key=False, nullable=True)
    jdet_task_type = Column(VARCHAR(2), primary_key=False, nullable=True)
    jdet_object = Column(VARCHAR(30), primary_key=False, nullable=True)
    jdet_form = Column(VARCHAR(30), primary_key=False, nullable=True)
    jdet_version = Column(VARCHAR(30), primary_key=False, nullable=True)
    jdet_secured = Column(VARCHAR(30), primary_key=False, nullable=True)
    jdet_ukid = Column(INTEGER, primary_key=False, nullable=True)


class LicenseCsi(Base):
    __tablename__ = 'license_csi'
    csi_id = Column(INTEGER, primary_key=True, nullable=False)
    csi_description = Column(VARCHAR(255), primary_key=False, nullable=True)
    csi_from_date = Column(DATE, primary_key=False, nullable=True)
    csi_to_date = Column(DATE, primary_key=False, nullable=True)
    csi_status = Column(VARCHAR(1), primary_key=False, nullable=True)
    csi_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    csi_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class LicenseCsiApps(Base):
    __tablename__ = 'license_csi_apps'
    lca_csi_id = Column(INTEGER, primary_key=True, nullable=False)
    lca_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    lca_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lca_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["lca_csi_id"], ["license_csi.csi_id"], name="licensecsiapps_fk1", ondelete="CASCADE"),
    )
    licensecsi_rel = relationship('license_csi')


class LicenseCsiComponents(Base):
    __tablename__ = 'license_csi_components'
    lcc_csi_id = Column(INTEGER, primary_key=True, nullable=False)
    lcc_cpt_id = Column(INTEGER, primary_key=True, nullable=False)
    lcc_met_id = Column(INTEGER, primary_key=True, nullable=False)
    lcc_quantity = Column(INTEGER, primary_key=False, nullable=True)
    lcc_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lcc_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    lcc_ukid = Column(INTEGER, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["lcc_csi_id"], ["license_csi.csi_id"], name="licensecsicomponents_fk1", ondelete="CASCADE"),
    )
    licensecsi_rel = relationship('license_csi')


class LicenseJdeEmployees(Base):
    __tablename__ = 'license_jde_employees'
    lemp_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    lemp_dt_extract = Column(DATE, primary_key=True, nullable=False)
    lemp_id = Column(INTEGER, primary_key=True, nullable=False)
    lemp_name = Column(VARCHAR(40), primary_key=False, nullable=True)
    lemp_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    lemp_type_desc = Column(VARCHAR(30), primary_key=False, nullable=True)
    lemp_company = Column(VARCHAR(5), primary_key=False, nullable=True)
    lemp_dt_start = Column(DATE, primary_key=False, nullable=True)
    lemp_dt_work = Column(DATE, primary_key=False, nullable=True)


class LicenseJdeOut(Base):
    __tablename__ = 'license_jde_out'
    lout_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    lout_object = Column(VARCHAR(10), primary_key=True, nullable=False)
    lout_version = Column(VARCHAR(10), primary_key=True, nullable=False)
    lout_user = Column(VARCHAR(40), primary_key=True, nullable=False)
    lout_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    lout_usage = Column(DATE, primary_key=False, nullable=False)
    __table_args__ = (
        Index("license_jde_out_idx1", "lout_apps_id", "lout_user"),
    )



class LicenseJdeUsers(Base):
    __tablename__ = 'license_jde_users'
    lusr_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    lusr_user_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    lusr_schema = Column(VARCHAR(30), primary_key=True, nullable=False)
    lusr_table_name = Column(VARCHAR(30), primary_key=True, nullable=False)
    lusr_dt_transaction = Column(DATE, primary_key=True, nullable=False)
    lusr_count = Column(INTEGER, primary_key=False, nullable=True)


class SecurityActivityLog(Base):
    __tablename__ = 'security_activity_log'
    acl_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    acl_user_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    acl_schema = Column(VARCHAR(30), primary_key=True, nullable=False)
    acl_table_name = Column(VARCHAR(30), primary_key=True, nullable=False)
    acl_dt_transaction = Column(DATE, primary_key=True, nullable=False)
    acl_count = Column(INTEGER, primary_key=False, nullable=True)
    acl_object_id = Column(VARCHAR(50), primary_key=True, nullable=False)


class SecurityAssignments(Base):
    __tablename__ = 'security_assignments'
    rlu_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    rlu_user_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    rlu_role_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    rlu_dt_effective = Column(DATE, primary_key=False, nullable=True)
    rlu_dt_expiration = Column(DATE, primary_key=False, nullable=True)
    rlu_dt_refresh = Column(DATE, primary_key=False, nullable=True)
    rlu_ukid = Column(INTEGER, primary_key=False, nullable=True)
    __table_args__ = (
        Index("security_assignments_idx1", "rlu_apps_id", "rlu_role_id", "rlu_user_id"),
    )



class SecurityAssignmentsDollar(Base):
    __tablename__ = 'security_assignments$'
    rlu_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    rlu_user_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    rlu_role_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    rlu_dt_effective = Column(DATE, primary_key=False, nullable=True)
    rlu_dt_expiration = Column(DATE, primary_key=False, nullable=True)
    rlu_dt_refresh = Column(DATE, primary_key=False, nullable=True)
    rlu_ukid = Column(INTEGER, primary_key=True, nullable=False)


class SecurityLdap(Base):
    __tablename__ = 'security_ldap'
    ldap_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    ldap_account = Column(VARCHAR(30), primary_key=True, nullable=False)
    ldap_dn = Column(VARCHAR(1024), primary_key=False, nullable=True)
    ldap_name = Column(VARCHAR(256), primary_key=False, nullable=True)
    ldap_logon = Column(VARCHAR(256), primary_key=False, nullable=True)
    ldap_company = Column(VARCHAR(50), primary_key=False, nullable=True)
    ldap_city = Column(VARCHAR(50), primary_key=False, nullable=True)
    ldap_department = Column(VARCHAR(100), primary_key=False, nullable=True)
    ldap_description = Column(VARCHAR(100), primary_key=False, nullable=True)
    ldap_display_name = Column(VARCHAR(256), primary_key=False, nullable=True)
    ldap_mail = Column(VARCHAR(256), primary_key=False, nullable=True)
    ldap_manager = Column(VARCHAR(1024), primary_key=False, nullable=True)
    ldap_office = Column(VARCHAR(255), primary_key=False, nullable=True)
    ldap_telephone = Column(VARCHAR(30), primary_key=False, nullable=True)
    ldap_mobile = Column(VARCHAR(30), primary_key=False, nullable=True)
    ldap_title = Column(VARCHAR(100), primary_key=False, nullable=True)
    ldap_creation = Column(DATE, primary_key=False, nullable=True)
    ldap_expires = Column(DATE, primary_key=False, nullable=True)
    ldap_never_expires = Column(VARCHAR(1), primary_key=False, nullable=True)
    ldap_refresh = Column(DATE, primary_key=False, nullable=True)
    ldap_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SecurityLdapDpt(Base):
    __tablename__ = 'security_ldap_dpt'
    ldapd_group = Column(VARCHAR(30), primary_key=True, nullable=False)
    ldapd_departement = Column(VARCHAR(100), primary_key=True, nullable=False)
    ldapd_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    ldapd_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ldapd_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SecurityMenus(Base):
    __tablename__ = 'security_menus'
    menu_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    menu_language = Column(VARCHAR(4), primary_key=True, nullable=False)
    menu_root_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    menu_parent_id = Column(VARCHAR(40), primary_key=False, nullable=True)
    menu_child_id = Column(VARCHAR(40), primary_key=False, nullable=True)
    menu_id = Column(VARCHAR(40), primary_key=False, nullable=True)
    menu_root = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_level1 = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_level2 = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_level3 = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_level4 = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_level5 = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_level6 = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_level7 = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_level8 = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_level9 = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_level10 = Column(VARCHAR(100), primary_key=False, nullable=True)
    menu_object = Column(VARCHAR(50), primary_key=False, nullable=True)
    menu_form = Column(VARCHAR(30), primary_key=False, nullable=True)
    menu_version = Column(VARCHAR(30), primary_key=False, nullable=True)
    menu_level = Column(INTEGER, primary_key=False, nullable=True)
    menu_seq = Column(INTEGER, primary_key=False, nullable=True)
    menu_seq_ukid = Column(VARCHAR(150), primary_key=True, nullable=False)
    menu_refresh = Column(DATE, primary_key=False, nullable=True)
    menu_ukid = Column(INTEGER, primary_key=False, nullable=True)
    __table_args__ = (
        Index("security_menus_idx1", "menu_seq_ukid"),
        Index("security_menus_idx2", "menu_root_id"),
        Index("security_menus_idx3", "menu_apps_id", "menu_root_id", "menu_parent_id", "menu_child_id"),
    )



class SecurityRights(Base):
    __tablename__ = 'security_rights'
    ser_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    ser_root_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    ser_role_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    ser_user_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    ser_menu_sequkid = Column(VARCHAR(150), primary_key=True, nullable=False)
    ser_role_action_id = Column(VARCHAR(30), primary_key=False, nullable=True)
    ser_object = Column(VARCHAR(50), primary_key=True, nullable=False)
    serl_form = Column(VARCHAR(30), primary_key=False, nullable=True)
    ser_version = Column(VARCHAR(30), primary_key=True, nullable=False)
    ser_run = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_add = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_chg = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_del = Column(VARCHAR(1), primary_key=False, nullable=True)
    ser_refresh = Column(DATE, primary_key=False, nullable=True)
    ser_ukid = Column(INTEGER, primary_key=False, nullable=True)
    __table_args__ = (
        Index("security_rights_idx1", "ser_apps_id", "ser_role_id", "ser_menu_sequkid"),
        Index("security_rights_idx2", "ser_apps_id", "ser_user_id", "ser_role_id", "ser_run"),
    )



class SecurityRoles(Base):
    __tablename__ = 'security_roles'
    rol_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    rol_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    rol_name = Column(VARCHAR(255), primary_key=False, nullable=True)
    rol_seq = Column(INTEGER, primary_key=False, nullable=True)
    rol_dt_refresh = Column(DATE, primary_key=False, nullable=True)
    rol_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SecurityRolesDollar(Base):
    __tablename__ = 'security_roles$'
    rol_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    rol_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    rol_name = Column(VARCHAR(255), primary_key=False, nullable=True)
    rol_seq = Column(INTEGER, primary_key=False, nullable=True)
    rol_dt_refresh = Column(DATE, primary_key=False, nullable=True)
    rol_ukid = Column(INTEGER, primary_key=True, nullable=False)


class SecurityUsers(Base):
    __tablename__ = 'security_users'
    usr_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    usr_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    usr_name = Column(VARCHAR(255), primary_key=False, nullable=True)
    usr_registration = Column(VARCHAR(50), primary_key=False, nullable=True)
    usr_status = Column(VARCHAR(2), primary_key=False, nullable=True)
    usr_dt_login = Column(DATE, primary_key=False, nullable=True)
    usr_dt_creation = Column(DATE, primary_key=False, nullable=True)
    usr_privileged = Column(VARCHAR(1), primary_key=False, nullable=True)
    usr_dt_refresh = Column(DATE, primary_key=False, nullable=True)
    usr_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SecurityUsersData(Base):
    __tablename__ = 'security_users_data'
    usrd_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    usrd_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    usrd_an8 = Column(INTEGER, primary_key=False, nullable=True)
    usrd_ac01 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_ac01_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_ac02 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_ac02_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_ac03 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_ac03_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_ac04 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_ac04_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_ac05 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_ac05_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_dt_refresh = Column(DATE, primary_key=False, nullable=True)
    usrd_ukid = Column(INTEGER, primary_key=False, nullable=True)
    usrd_abat1 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_abat1_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_ullngp = Column(VARCHAR(2), primary_key=False, nullable=True)
    usrd_ulfrmt = Column(VARCHAR(3), primary_key=False, nullable=True)
    usrd_ulctr = Column(VARCHAR(3), primary_key=False, nullable=True)
    usrd_ulluser = Column(VARCHAR(254), primary_key=False, nullable=True)
    usrd_mcco = Column(VARCHAR(5), primary_key=False, nullable=True)
    usrd_mcmcu = Column(VARCHAR(12), primary_key=False, nullable=True)
    usrd_mcrp09 = Column(VARCHAR(3), primary_key=False, nullable=True)
    usrd_mcrp08 = Column(VARCHAR(3), primary_key=False, nullable=True)
    usrd_eaemal = Column(VARCHAR(256), primary_key=False, nullable=True)


class SecurityUsersDataDollar(Base):
    __tablename__ = 'security_users_data$'
    usrd_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    usrd_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    usrd_an8 = Column(INTEGER, primary_key=False, nullable=True)
    usrd_ac01 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_ac01_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_ac02 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_ac02_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_ac03 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_ac03_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_ac04 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_ac04_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_ac05 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_ac05_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_dt_refresh = Column(DATE, primary_key=False, nullable=True)
    usrd_ukid = Column(INTEGER, primary_key=True, nullable=False)
    usrd_abat1 = Column(VARCHAR(10), primary_key=False, nullable=True)
    usrd_abat1_desc = Column(VARCHAR(40), primary_key=False, nullable=True)
    usrd_ullngp = Column(VARCHAR(2), primary_key=False, nullable=True)
    usrd_ulfrmt = Column(VARCHAR(3), primary_key=False, nullable=True)
    usrd_ulctr = Column(VARCHAR(3), primary_key=False, nullable=True)
    usrd_ulluser = Column(VARCHAR(254), primary_key=False, nullable=True)
    usrd_mcco = Column(VARCHAR(5), primary_key=False, nullable=True)
    usrd_mcmcu = Column(VARCHAR(12), primary_key=False, nullable=True)
    usrd_mcrp09 = Column(VARCHAR(3), primary_key=False, nullable=True)
    usrd_mcrp08 = Column(VARCHAR(3), primary_key=False, nullable=True)
    usrd_eaemal = Column(VARCHAR(256), primary_key=False, nullable=True)


class SecurityUsersDollar(Base):
    __tablename__ = 'security_users$'
    usr_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    usr_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    usr_name = Column(VARCHAR(255), primary_key=False, nullable=True)
    usr_registration = Column(VARCHAR(50), primary_key=False, nullable=True)
    usr_status = Column(VARCHAR(2), primary_key=False, nullable=True)
    usr_dt_login = Column(DATE, primary_key=False, nullable=True)
    usr_dt_creation = Column(DATE, primary_key=False, nullable=True)
    usr_privileged = Column(VARCHAR(1), primary_key=False, nullable=True)
    usr_dt_refresh = Column(DATE, primary_key=False, nullable=True)
    usr_ukid = Column(INTEGER, primary_key=True, nullable=False)


class SecurityUsersProp(Base):
    __tablename__ = 'security_users_prop'
    usrp_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    usrp_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    usrp_name = Column(VARCHAR(255), primary_key=False, nullable=True)
    usrp_privileged = Column(VARCHAR(1), primary_key=False, nullable=True)
    usrp_technical = Column(VARCHAR(1), primary_key=False, nullable=True)
    usrp_generic = Column(VARCHAR(1), primary_key=False, nullable=True)
    usrp_generic_count = Column(INTEGER, primary_key=False, nullable=True)
    usrp_is_linked = Column(VARCHAR(1), primary_key=False, nullable=True)
    usrp_id_linked = Column(VARCHAR(30), primary_key=False, nullable=True)
    usrp_is_previous = Column(VARCHAR(1), primary_key=False, nullable=True)
    usrp_id_previous = Column(VARCHAR(30), primary_key=False, nullable=True)
    usrp_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    usrp_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    usrp_ukid = Column(INTEGER, primary_key=False, nullable=True)
    __table_args__ = (
        Index("security_users_prop_idx1", "usrp_apps_id", "usrp_technical", "usrp_is_linked"),
    )



class SecurityUsersPropDollar(Base):
    __tablename__ = 'security_users_prop$'
    usrp_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    usrp_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    usrp_name = Column(VARCHAR(255), primary_key=False, nullable=True)
    usrp_privileged = Column(VARCHAR(1), primary_key=False, nullable=True)
    usrp_technical = Column(VARCHAR(1), primary_key=False, nullable=True)
    usrp_generic = Column(VARCHAR(1), primary_key=False, nullable=True)
    usrp_generic_count = Column(INTEGER, primary_key=False, nullable=True)
    usrp_is_linked = Column(VARCHAR(1), primary_key=False, nullable=True)
    usrp_id_linked = Column(VARCHAR(30), primary_key=False, nullable=True)
    usrp_is_previous = Column(VARCHAR(1), primary_key=False, nullable=True)
    usrp_id_previous = Column(VARCHAR(30), primary_key=False, nullable=True)
    usrp_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    usrp_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    usrp_ukid = Column(INTEGER, primary_key=True, nullable=False)


class SecurityXref(Base):
    __tablename__ = 'security_xref'
    xref_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    xref_type_from = Column(VARCHAR(4), primary_key=False, nullable=True)
    xref_object_from = Column(VARCHAR(50), primary_key=True, nullable=False)
    xref_description_from = Column(VARCHAR(100), primary_key=False, nullable=True)
    xref_type_to = Column(VARCHAR(4), primary_key=False, nullable=True)
    xref_object_to = Column(VARCHAR(50), primary_key=True, nullable=False)
    xref_description_to = Column(VARCHAR(100), primary_key=False, nullable=True)
    xref_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsActivityLog(Base):
    __tablename__ = 'settings_activity_log'
    acl_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    acl_type = Column(VARCHAR(20), primary_key=True, nullable=False)
    acl_apps_type = Column(VARCHAR(20), primary_key=True, nullable=False)
    acl_name = Column(VARCHAR(100), primary_key=True, nullable=False)
    acl_rule = Column(VARCHAR(20), primary_key=False, nullable=False)
    acl_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    acl_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["acl_apps_id"], ["settings_applications.apps_id"], name="settingsactivitylog_fk1", ondelete="CASCADE"),
    )
    settingsapplications_rel = relationship('settings_applications')


class SettingsApplications(Base):
    __tablename__ = 'settings_applications'
    apps_id = Column(INTEGER, primary_key=True, nullable=False)
    apps_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    apps_ctry_id = Column(VARCHAR(3), primary_key=False, nullable=True)
    apps_name = Column(VARCHAR(50), primary_key=False, nullable=True)
    apps_dbtype = Column(VARCHAR(10), primary_key=False, nullable=True)
    apps_jdbc = Column(VARCHAR(500), primary_key=False, nullable=True)
    apps_user = Column(VARCHAR(50), primary_key=False, nullable=True)
    apps_password = Column(TEXT, primary_key=False, nullable=True)
    apps_host = Column(VARCHAR(100), primary_key=False, nullable=True)
    apps_port = Column(INTEGER, primary_key=False, nullable=True)
    apps_database = Column(VARCHAR(100), primary_key=False, nullable=True)
    apps_directdb = Column(VARCHAR(1), primary_key=False, nullable=True)
    apps_dblink = Column(VARCHAR(20), primary_key=False, nullable=True)
    apps_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    apps_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class SettingsAudit(Base):
    __tablename__ = 'settings_audit'
    aud_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    aud_user = Column(VARCHAR(50), primary_key=False, nullable=True)
    aud_password = Column(TEXT, primary_key=False, nullable=True)
    aud_host = Column(VARCHAR(100), primary_key=False, nullable=True)
    aud_port = Column(INTEGER, primary_key=False, nullable=True)
    aud_database = Column(VARCHAR(100), primary_key=False, nullable=True)
    aud_scn = Column(BIGINT, primary_key=False, nullable=True)
    aud_last = Column(TIMESTAMP, primary_key=False, nullable=True)
    aud_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    aud_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class SettingsCustomsql(Base):
    __tablename__ = 'settings_customsql'
    sql_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    sql_method = Column(VARCHAR(50), primary_key=True, nullable=False)
    sql_blob = Column(TEXT, primary_key=False, nullable=True)
    sql_jdbc = Column(VARCHAR(500), primary_key=False, nullable=True)
    sql_user = Column(VARCHAR(20), primary_key=False, nullable=True)
    sql_password = Column(VARCHAR(100), primary_key=False, nullable=True)
    sql_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    sql_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class SettingsDbFeatures(Base):
    __tablename__ = 'settings_db_features'
    fea_id = Column(INTEGER, primary_key=True, nullable=False)
    fea_cpt_id = Column(INTEGER, primary_key=False, nullable=False)
    fea_features = Column(VARCHAR(255), primary_key=False, nullable=True)
    fea_description = Column(VARCHAR(1000), primary_key=False, nullable=True)
    fea_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    fea_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    fea_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsDbOptions(Base):
    __tablename__ = 'settings_db_options'
    opt_id = Column(INTEGER, primary_key=True, nullable=False)
    opt_cpt_id = Column(INTEGER, primary_key=False, nullable=False)
    opt_option = Column(VARCHAR(255), primary_key=False, nullable=True)
    opt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    opt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    opt_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsDbVersions(Base):
    __tablename__ = 'settings_db_versions'
    ver_id = Column(INTEGER, primary_key=True, nullable=False)
    ver_cpt_id = Column(INTEGER, primary_key=False, nullable=False)
    ver_version = Column(VARCHAR(255), primary_key=False, nullable=True)
    ver_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    ver_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ver_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsDwh(Base):
    __tablename__ = 'settings_dwh'
    dwh_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    dwh_type = Column(VARCHAR(3), primary_key=True, nullable=False)
    dwh_instance = Column(VARCHAR(50), primary_key=True, nullable=False)
    dwh_target = Column(VARCHAR(50), primary_key=True, nullable=False)
    dwh_seq = Column(INTEGER, primary_key=False, nullable=True)
    dwh_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    dwh_schema = Column(VARCHAR(100), primary_key=False, nullable=True)
    dwh_mode = Column(VARCHAR(7), primary_key=False, nullable=True)
    dwh_days = Column(INTEGER, primary_key=False, nullable=True)
    dwh_query = Column(TEXT, primary_key=False, nullable=True)
    dwh_dt_update = Column(TIMESTAMP, primary_key=False, nullable=True)
    dwh_status = Column(VARCHAR(1), primary_key=False, nullable=True)
    dwh_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    dwh_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    dwh_log = Column(TEXT, primary_key=False, nullable=True)
    dwh_dt_ctrl = Column(TIMESTAMP, primary_key=False, nullable=True)
    dwh_ctrl_status = Column(VARCHAR(1), primary_key=False, nullable=True)
    dwh_ctrl_where = Column(TEXT, primary_key=False, nullable=True)
    dwh_ctrl_log = Column(TEXT, primary_key=False, nullable=True)
    dwh_before = Column(INTEGER, primary_key=False, nullable=True)
    dwh_after = Column(INTEGER, primary_key=False, nullable=True)
    dwh_group = Column(VARCHAR(100), primary_key=False, nullable=True)
    dwh_pk = Column(VARCHAR(100), primary_key=False, nullable=True)
    dwh_delta = Column(VARCHAR(250), primary_key=False, nullable=True)


class SettingsJdePrereq(Base):
    __tablename__ = 'settings_jde_prereq'
    prq_product = Column(VARCHAR(255), primary_key=False, nullable=True)
    prq_component = Column(VARCHAR(255), primary_key=True, nullable=False)
    prq_prereq = Column(VARCHAR(255), primary_key=True, nullable=False)
    prq_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    prq_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    prq_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsJdeRclst(Base):
    __tablename__ = 'settings_jde_rclst'
    jdes_object = Column(VARCHAR(10), primary_key=True, nullable=False)
    jdes_description = Column(VARCHAR(60), primary_key=False, nullable=True)
    jdes_sy = Column(VARCHAR(30), primary_key=False, nullable=True)
    jdes_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    jdes_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    jdes_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsJdeRestrictions(Base):
    __tablename__ = 'settings_jde_restrictions'
    rtc_product = Column(VARCHAR(255), primary_key=False, nullable=True)
    rtc_component = Column(VARCHAR(255), primary_key=True, nullable=False)
    rtc_restriction = Column(VARCHAR(1000), primary_key=True, nullable=False)
    rtc_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    rtc_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    rtc_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsJdeSy(Base):
    __tablename__ = 'settings_jde_sy'
    syc_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    syc_description = Column(VARCHAR(255), primary_key=False, nullable=True)
    syc_module = Column(VARCHAR(255), primary_key=False, nullable=True)
    syc_component_e1 = Column(VARCHAR(255), primary_key=False, nullable=True)
    syc_cpt_id = Column(INTEGER, primary_key=False, nullable=True)
    syc_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    syc_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    syc_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsJdeTv(Base):
    __tablename__ = 'settings_jde_tv'
    tv_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    tv_task_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    tv_task_name = Column(VARCHAR(40), primary_key=False, nullable=True)
    tv_security = Column(VARCHAR(1), primary_key=False, nullable=True)
    tv_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    tv_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["tv_apps_id"], ["settings_applications.apps_id"], name="settingsjdetv_fk1", ondelete="CASCADE"),
    )
    settingsapplications_rel = relationship('settings_applications')


class SettingsJdedwards(Base):
    __tablename__ = 'settings_jdedwards'
    apps_id = Column(INTEGER, primary_key=True, nullable=False)
    jde_sy = Column(VARCHAR(30), primary_key=False, nullable=True)
    jde_dta = Column(VARCHAR(30), primary_key=False, nullable=True)
    jde_ctl = Column(VARCHAR(30), primary_key=False, nullable=True)
    jde_svm = Column(VARCHAR(30), primary_key=False, nullable=True)
    jde_co = Column(VARCHAR(30), primary_key=False, nullable=True)
    jde_ol = Column(VARCHAR(30), primary_key=False, nullable=True)
    jde_f00950 = Column(VARCHAR(30), primary_key=False, nullable=True)
    jde_menu_standard = Column(VARCHAR(1), primary_key=False, nullable=True)
    jde_e1pages = Column(VARCHAR(1), primary_key=False, nullable=True)
    jde_e1composite = Column(VARCHAR(1), primary_key=False, nullable=True)
    jde_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    jde_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["apps_id"], ["settings_applications.apps_id"], name="settingsjdedwards_fk1", ondelete="CASCADE"),
    )
    settingsapplications_rel = relationship('settings_applications')


class SettingsLdap(Base):
    __tablename__ = 'settings_ldap'
    ldap_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    ldap_context = Column(VARCHAR(500), primary_key=False, nullable=True)
    ldap_filter = Column(VARCHAR(500), primary_key=False, nullable=True)
    ldap_exclude = Column(VARCHAR(500), primary_key=False, nullable=True)
    ldap_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    ldap_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    __table_args__ = (
        ForeignKeyConstraint(["ldap_apps_id"], ["settings_applications.apps_id"], name="settingsldap_fk1", ondelete="CASCADE"),
    )
    settingsapplications_rel = relationship('settings_applications')


class SettingsLicComponents(Base):
    __tablename__ = 'settings_lic_components'
    cpt_id = Column(INTEGER, primary_key=True, nullable=False)
    cpt_lists = Column(VARCHAR(50), primary_key=False, nullable=True)
    cpt_category = Column(VARCHAR(255), primary_key=False, nullable=True)
    cpt_component = Column(VARCHAR(255), primary_key=False, nullable=False)
    cpt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cpt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    cpt_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsLicMetrics(Base):
    __tablename__ = 'settings_lic_metrics'
    met_id = Column(INTEGER, primary_key=True, nullable=False)
    met_description = Column(VARCHAR(255), primary_key=False, nullable=True)
    met_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    met_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    met_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsLicPricing(Base):
    __tablename__ = 'settings_lic_pricing'
    prc_id = Column(INTEGER, primary_key=True, nullable=False)
    prc_cpt_id = Column(INTEGER, primary_key=True, nullable=False)
    prc_met_id = Column(INTEGER, primary_key=True, nullable=False)
    prc_price = Column(REAL, primary_key=False, nullable=True)
    prc_minimum = Column(VARCHAR(30), primary_key=False, nullable=True)
    prc_support = Column(REAL, primary_key=False, nullable=True)
    prc_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    prc_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    prc_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SettingsQuery(Base):
    __tablename__ = 'settings_query'
    path = Column(VARCHAR(100), primary_key=True, nullable=False)
    crud = Column(VARCHAR(10), primary_key=True, nullable=False)
    sqlquery = Column(TEXT, primary_key=False, nullable=True)
    orderby = Column(VARCHAR(100), primary_key=False, nullable=True)


class SettingsUsers(Base):
    __tablename__ = 'settings_users'
    susr_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    susr_password = Column(VARCHAR(40), primary_key=False, nullable=True)
    susr_name = Column(VARCHAR(255), primary_key=False, nullable=True)
    susr_email = Column(VARCHAR(255), primary_key=False, nullable=True)
    susr_status = Column(VARCHAR(2), primary_key=False, nullable=True)
    susr_apps_update = Column(VARCHAR(1), primary_key=False, nullable=True)
    susr_apps_settings = Column(VARCHAR(1), primary_key=False, nullable=True)
    susr_apps_security = Column(VARCHAR(1), primary_key=False, nullable=True)
    susr_apps_license = Column(VARCHAR(1), primary_key=False, nullable=True)
    susr_apps_performance = Column(VARCHAR(1), primary_key=False, nullable=True)
    susr_apps_reporting = Column(VARCHAR(1), primary_key=False, nullable=True)
    susr_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    susr_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class SodActivities(Base):
    __tablename__ = 'sod_activities'
    act_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    act_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    act_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    act_name = Column(VARCHAR(100), primary_key=False, nullable=True)
    act_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    act_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    act_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SodActivitiesDollar(Base):
    __tablename__ = 'sod_activities$'
    act_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    act_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    act_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    act_name = Column(VARCHAR(100), primary_key=False, nullable=True)
    act_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    act_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    act_ukid = Column(INTEGER, primary_key=True, nullable=False)


class SodConflictDetails(Base):
    __tablename__ = 'sod_conflict_details'
    cfd_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    cfd_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    cfd_act1_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    cfd_act2_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    cfd_risk_id = Column(VARCHAR(10), primary_key=False, nullable=True)
    cfd_user_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    cfd_privileged = Column(VARCHAR(1), primary_key=True, nullable=False)
    cfd_role1_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    cfd_role2_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    cfd_act1_object = Column(VARCHAR(50), primary_key=True, nullable=False)
    cfd_act2_object = Column(VARCHAR(50), primary_key=True, nullable=False)
    cfd_refresh = Column(DATE, primary_key=False, nullable=True)
    cfd_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SodConflictSummary(Base):
    __tablename__ = 'sod_conflict_summary'
    cfs_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    cfs_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    cfs_act1_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    cfs_act2_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    cfs_risk_id = Column(VARCHAR(10), primary_key=False, nullable=True)
    cfs_privileged = Column(VARCHAR(1), primary_key=True, nullable=False)
    cfs_count = Column(INTEGER, primary_key=False, nullable=True)
    cfs_refresh = Column(DATE, primary_key=False, nullable=True)
    cfs_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SodConflictSummaryDollar(Base):
    __tablename__ = 'sod_conflict_summary$'
    cfs_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    cfs_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    cfs_act1_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    cfs_act2_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    cfs_risk_id = Column(VARCHAR(10), primary_key=False, nullable=True)
    cfs_privileged = Column(VARCHAR(1), primary_key=True, nullable=False)
    cfs_count = Column(INTEGER, primary_key=False, nullable=True)
    cfs_refresh = Column(DATE, primary_key=False, nullable=True)
    cfs_ukid = Column(INTEGER, primary_key=True, nullable=False)


class SodMatrix(Base):
    __tablename__ = 'sod_matrix'
    matrix_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    matrix_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    matrix_act1_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    matrix_act2_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    matrix_risk_id = Column(VARCHAR(10), primary_key=False, nullable=True)
    matrix_risk_level = Column(INTEGER, primary_key=False, nullable=True)
    matrix_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    matrix_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    matrix_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SodMatrixDollar(Base):
    __tablename__ = 'sod_matrix$'
    matrix_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    matrix_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    matrix_act1_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    matrix_act2_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    matrix_risk_id = Column(VARCHAR(10), primary_key=False, nullable=True)
    matrix_risk_level = Column(INTEGER, primary_key=False, nullable=True)
    matrix_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    matrix_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    matrix_ukid = Column(INTEGER, primary_key=True, nullable=False)


class SodObjects(Base):
    __tablename__ = 'sod_objects'
    object_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    object_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    object_act_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    object_row_id = Column(INTEGER, primary_key=True, nullable=False)
    object_id = Column(VARCHAR(50), primary_key=False, nullable=True)
    object_name = Column(VARCHAR(100), primary_key=False, nullable=True)
    object_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    object_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    object_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SodObjectsDollar(Base):
    __tablename__ = 'sod_objects$'
    object_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    object_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    object_act_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    object_row_id = Column(INTEGER, primary_key=True, nullable=False)
    object_id = Column(VARCHAR(50), primary_key=False, nullable=True)
    object_name = Column(VARCHAR(100), primary_key=False, nullable=True)
    object_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    object_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    object_ukid = Column(INTEGER, primary_key=True, nullable=False)


class SodProcess(Base):
    __tablename__ = 'sod_process'
    process_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    process_name = Column(VARCHAR(100), primary_key=False, nullable=True)
    process_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    process_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    process_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SodProcessDollar(Base):
    __tablename__ = 'sod_process$'
    process_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    process_name = Column(VARCHAR(100), primary_key=False, nullable=True)
    process_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    process_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    process_ukid = Column(INTEGER, primary_key=True, nullable=False)


class SodRisks(Base):
    __tablename__ = 'sod_risks'
    risk_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    risk_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    risk_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    risk_name = Column(VARCHAR(250), primary_key=False, nullable=True)
    risk_level = Column(VARCHAR(1), primary_key=False, nullable=True)
    risk_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    risk_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    risk_ukid = Column(INTEGER, primary_key=False, nullable=True)


class SodRisksDollar(Base):
    __tablename__ = 'sod_risks$'
    risk_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    risk_process_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    risk_id = Column(VARCHAR(10), primary_key=True, nullable=False)
    risk_name = Column(VARCHAR(250), primary_key=False, nullable=True)
    risk_level = Column(VARCHAR(1), primary_key=False, nullable=True)
    risk_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    risk_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    risk_ukid = Column(INTEGER, primary_key=True, nullable=False)


