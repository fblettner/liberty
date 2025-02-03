"""Auto-generated SQLAlchemy models."""

from sqlalchemy import BOOLEAN, INTEGER, TEXT, TIMESTAMP, VARCHAR, Column, Integer, String, ForeignKey, Boolean, DateTime, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Ly_dictionary(Base):
    __tablename__ = 'ly_dictionary'
    dd_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    dd_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    dd_type = Column(VARCHAR(40), primary_key=False, nullable=True)
    dd_rules = Column(VARCHAR(20), primary_key=False, nullable=True)
    dd_rules_values = Column(VARCHAR(50), primary_key=False, nullable=True)
    dd_default = Column(VARCHAR(50), primary_key=False, nullable=True)
    dd_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    dd_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_function(Base):
    __tablename__ = 'ly_function'
    fct_id = Column(INTEGER, primary_key=True, nullable=False)
    fct_name = Column(VARCHAR(100), primary_key=False, nullable=False)
    fct_label = Column(VARCHAR(255), primary_key=False, nullable=True)
    fct_script = Column(TEXT, primary_key=False, nullable=True)
    fct_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    fct_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_act_branch(Base):
    __tablename__ = 'ly_act_branch'
    act_id = Column(INTEGER, ForeignKey('ly_actions.act_id'), primary_key=True, nullable=False)
    brc_id = Column(INTEGER, primary_key=True, nullable=False)
    brc_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    brc_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    brc_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_actions_rel = relationship('Ly_actions')


class Ly_actions(Base):
    __tablename__ = 'ly_actions'
    act_id = Column(INTEGER, primary_key=True, nullable=False)
    act_label = Column(VARCHAR(255), primary_key=False, nullable=True)
    act_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    act_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_dlg_col(Base):
    __tablename__ = 'ly_dlg_col'
    frm_id = Column(INTEGER, ForeignKey('ly_dlg_frm.frm_id'), primary_key=True, nullable=False)
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
    ly_dlg_frm_rel = relationship('Ly_dlg_frm')


class Ly_dlg_frm(Base):
    __tablename__ = 'ly_dlg_frm'
    dlg_id = Column(INTEGER, ForeignKey('ly_dialogs.dlg_id'), primary_key=False, nullable=False)
    frm_id = Column(INTEGER, primary_key=True, nullable=False)
    frm_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    frm_query_id = Column(INTEGER, primary_key=False, nullable=True)
    frm_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    frm_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_dialogs_rel = relationship('Ly_dialogs')


class Ly_dialogs(Base):
    __tablename__ = 'ly_dialogs'
    dlg_id = Column(INTEGER, primary_key=True, nullable=False)
    dlg_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    dlg_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    dlg_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_ctx_val(Base):
    __tablename__ = 'ly_ctx_val'
    ctx_id = Column(INTEGER, ForeignKey('ly_ctxmenus.ctx_id'), primary_key=True, nullable=False)
    val_id = Column(INTEGER, primary_key=True, nullable=False)
    val_seq = Column(INTEGER, primary_key=False, nullable=True)
    val_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    val_component = Column(VARCHAR(40), primary_key=False, nullable=True)
    val_component_id = Column(INTEGER, primary_key=False, nullable=True)
    val_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    val_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_ctxmenus_rel = relationship('Ly_ctxmenus')


class Ly_ctxmenus(Base):
    __tablename__ = 'ly_ctxmenus'
    ctx_id = Column(INTEGER, primary_key=True, nullable=False)
    ctx_description = Column(VARCHAR(50), primary_key=False, nullable=True)
    ctx_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    ctx_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_components(Base):
    __tablename__ = 'ly_components'
    cpt_name = Column(VARCHAR(20), primary_key=True, nullable=False)
    cpt_description = Column(VARCHAR(100), primary_key=False, nullable=True)
    cpt_enabled = Column(VARCHAR(1), primary_key=False, nullable=True)
    cpt_usage = Column(TEXT, primary_key=False, nullable=True)
    cpt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cpt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_ctx_filters(Base):
    __tablename__ = 'ly_ctx_filters'
    ctx_id = Column(INTEGER, ForeignKey('ly_ctx_val.ctx_id'), primary_key=True, nullable=False)
    val_id = Column(INTEGER, ForeignKey('ly_ctx_val.val_id'), primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    ly_ctx_val_rel = relationship('Ly_ctx_val')


class Ly_ctx_val_l(Base):
    __tablename__ = 'ly_ctx_val_l'
    ctx_id = Column(INTEGER, ForeignKey('ly_ctx_val.ctx_id'), primary_key=True, nullable=False)
    val_id = Column(INTEGER, ForeignKey('ly_ctx_val.val_id'), primary_key=True, nullable=False)
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_ctx_val_rel = relationship('Ly_ctx_val')


class Ly_language(Base):
    __tablename__ = 'ly_language'
    lng_id = Column(VARCHAR(5), primary_key=True, nullable=False)
    lng_name = Column(VARCHAR(20), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_act_tasks(Base):
    __tablename__ = 'ly_act_tasks'
    act_id = Column(INTEGER, ForeignKey('ly_actions.act_id'), primary_key=True, nullable=False)
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
    ly_actions_rel = relationship('Ly_actions')


class Ly_dictionary_l(Base):
    __tablename__ = 'ly_dictionary_l'
    dd_id = Column(VARCHAR(50), ForeignKey('ly_dictionary.dd_id'), primary_key=True, nullable=False)
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_dictionary_rel = relationship('Ly_dictionary')


class Ly_dlg_filters(Base):
    __tablename__ = 'ly_dlg_filters'
    frm_id = Column(INTEGER, ForeignKey('ly_dlg_col.frm_id'), primary_key=True, nullable=False)
    col_id = Column(INTEGER, ForeignKey('ly_dlg_col.col_id'), primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    ly_dlg_col_rel = relationship('Ly_dlg_col')


class Ly_dlg_tab(Base):
    __tablename__ = 'ly_dlg_tab'
    frm_id = Column(INTEGER, ForeignKey('ly_dlg_frm.frm_id'), primary_key=True, nullable=False)
    tab_id = Column(INTEGER, primary_key=True, nullable=False)
    tab_seq = Column(INTEGER, primary_key=False, nullable=True)
    tab_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    tab_cdn_id = Column(INTEGER, primary_key=False, nullable=True)
    tab_cols = Column(INTEGER, primary_key=False, nullable=True)
    tab_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    tab_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    tab_disable_add = Column(VARCHAR(1), primary_key=False, nullable=True)
    tab_disable_edit = Column(VARCHAR(1), primary_key=False, nullable=True)
    ly_dlg_frm_rel = relationship('Ly_dlg_frm')


class Ly_dlg_tab_l(Base):
    __tablename__ = 'ly_dlg_tab_l'
    frm_id = Column(INTEGER, ForeignKey('ly_dlg_tab.frm_id'), primary_key=True, nullable=False)
    tab_id = Column(INTEGER, ForeignKey('ly_dlg_tab.tab_id'), primary_key=True, nullable=False)
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_dlg_tab_rel = relationship('Ly_dlg_tab')


class Ly_enum(Base):
    __tablename__ = 'ly_enum'
    enum_id = Column(INTEGER, primary_key=True, nullable=False)
    enum_label = Column(VARCHAR(40), primary_key=False, nullable=False)
    enum_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    enum_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    enum_display_add = Column(VARCHAR(1), primary_key=False, nullable=True)


class Ly_enum_val(Base):
    __tablename__ = 'ly_enum_val'
    enum_id = Column(INTEGER, ForeignKey('ly_enum.enum_id'), primary_key=True, nullable=False)
    val_enum = Column(VARCHAR(20), primary_key=True, nullable=False)
    val_label = Column(VARCHAR(200), primary_key=False, nullable=True)
    val_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    val_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_enum_rel = relationship('Ly_enum')


class Ly_enum_val_l(Base):
    __tablename__ = 'ly_enum_val_l'
    enum_id = Column(INTEGER, ForeignKey('ly_enum_val.enum_id'), primary_key=True, nullable=False)
    val_enum = Column(VARCHAR(20), ForeignKey('ly_enum_val.val_enum'), primary_key=True, nullable=False)
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(200), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_enum_val_rel = relationship('Ly_enum_val')


class Ly_lnk_val(Base):
    __tablename__ = 'ly_lnk_val'
    lnk_id = Column(INTEGER, ForeignKey('ly_links.lnk_id'), primary_key=True, nullable=False)
    val_id = Column(INTEGER, primary_key=True, nullable=False)
    val_sequence = Column(INTEGER, primary_key=False, nullable=False)
    val_label = Column(VARCHAR(40), primary_key=False, nullable=True)
    val_link = Column(VARCHAR(250), primary_key=False, nullable=True)
    val_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    val_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_links_rel = relationship('Ly_links')


class Ly_links(Base):
    __tablename__ = 'ly_links'
    lnk_id = Column(INTEGER, primary_key=True, nullable=False)
    lnk_component = Column(VARCHAR(20), primary_key=False, nullable=False)
    lnk_component_id = Column(INTEGER, primary_key=False, nullable=True)
    lnk_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lnk_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_cdn_grp(Base):
    __tablename__ = 'ly_cdn_grp'
    cdn_id = Column(INTEGER, ForeignKey('ly_condition.cdn_id'), primary_key=True, nullable=False)
    cdn_group = Column(INTEGER, primary_key=True, nullable=False)
    cdn_label = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_logical = Column(VARCHAR(20), primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_condition_rel = relationship('Ly_condition')


class Ly_condition(Base):
    __tablename__ = 'ly_condition'
    cdn_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_dlg_tab_cdn(Base):
    __tablename__ = 'ly_dlg_tab_cdn'
    frm_id = Column(INTEGER, ForeignKey('ly_dlg_tab.frm_id'), primary_key=True, nullable=False)
    tab_id = Column(INTEGER, ForeignKey('ly_dlg_tab.tab_id'), primary_key=True, nullable=False)
    cdn_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    cdn_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    cdn_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    ly_dlg_frm_rel = relationship('Ly_dlg_frm')
    ly_dlg_tab_rel = relationship('Ly_dlg_tab')


class Ly_lkp_params(Base):
    __tablename__ = 'ly_lkp_params'
    lkp_id = Column(INTEGER, ForeignKey('ly_lookup.lkp_id'), primary_key=True, nullable=False)
    dd_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    lkp_dir = Column(VARCHAR(20), primary_key=False, nullable=True)
    ly_lookup_rel = relationship('Ly_lookup')


class Ly_lookup(Base):
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


class Ly_act_params(Base):
    __tablename__ = 'ly_act_params'
    act_id = Column(INTEGER, ForeignKey('ly_actions.act_id'), primary_key=True, nullable=False)
    map_var = Column(VARCHAR(50), primary_key=True, nullable=False)
    map_dir = Column(VARCHAR(20), primary_key=False, nullable=True)
    map_display = Column(VARCHAR(1), primary_key=False, nullable=True)
    map_rules = Column(VARCHAR(10), primary_key=False, nullable=True)
    map_rules_values = Column(VARCHAR(50), primary_key=False, nullable=True)
    map_default = Column(VARCHAR(100), primary_key=False, nullable=True)
    map_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    map_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_actions_rel = relationship('Ly_actions')


class Ly_sequence(Base):
    __tablename__ = 'ly_sequence'
    seq_id = Column(INTEGER, primary_key=True, nullable=False)
    seq_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    seq_query_id = Column(INTEGER, primary_key=False, nullable=True)
    seq_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    seq_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    seq_dd_id = Column(VARCHAR(50), primary_key=False, nullable=True)


class Ly_events(Base):
    __tablename__ = 'ly_events'
    evt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_component = Column(VARCHAR(20), primary_key=False, nullable=False)
    evt_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    evt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    evt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_evt_cpt(Base):
    __tablename__ = 'ly_evt_cpt'
    evt_component = Column(VARCHAR(20), primary_key=True, nullable=False)
    evt_cpt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_col_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_seq_id = Column(INTEGER, primary_key=False, nullable=False)
    evt_act_id = Column(INTEGER, primary_key=False, nullable=False)
    evt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    evt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_menus(Base):
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


class Ly_menus_l(Base):
    __tablename__ = 'ly_menus_l'
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_seq_ukid = Column(VARCHAR(150), ForeignKey('ly_menus.menu_seq_ukid'), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(50), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_menus_rel = relationship('Ly_menus')


class Ly_query(Base):
    __tablename__ = 'ly_query'
    query_id = Column(INTEGER, primary_key=True, nullable=False)
    query_label = Column(VARCHAR(100), primary_key=False, nullable=False)
    query_type = Column(VARCHAR(20), primary_key=False, nullable=False)
    query_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    query_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_qry_sql(Base):
    __tablename__ = 'ly_qry_sql'
    query_id = Column(INTEGER, ForeignKey('ly_query.query_id'), primary_key=True, nullable=False)
    query_dbtype = Column(VARCHAR(10), primary_key=True, nullable=False)
    query_crud = Column(VARCHAR(10), primary_key=True, nullable=False)
    query_pool = Column(VARCHAR(10), primary_key=False, nullable=False)
    query_sqlquery = Column(TEXT, primary_key=False, nullable=True)
    query_orderby = Column(VARCHAR(100), primary_key=False, nullable=True)
    query_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    query_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_query_rel = relationship('Ly_query')


class Ly_seq_params(Base):
    __tablename__ = 'ly_seq_params'
    seq_id = Column(INTEGER, ForeignKey('ly_sequence.seq_id'), primary_key=True, nullable=False)
    dd_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_sequence_rel = relationship('Ly_sequence')


class Ly_roles(Base):
    __tablename__ = 'ly_roles'
    rol_id = Column(VARCHAR(30), primary_key=True, nullable=False)
    rol_name = Column(VARCHAR(255), primary_key=False, nullable=True)
    rol_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    rol_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_rol_auth(Base):
    __tablename__ = 'ly_rol_auth'
    rol_id = Column(VARCHAR(30), ForeignKey('ly_roles.rol_id'), primary_key=True, nullable=False)
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
    ly_roles_rel = relationship('Ly_roles')


class Ly_modules(Base):
    __tablename__ = 'ly_modules'
    module_id = Column(VARCHAR(40), primary_key=True, nullable=False)
    module_description = Column(VARCHAR(100), primary_key=False, nullable=True)
    module_enabled = Column(VARCHAR(1), primary_key=False, nullable=True)
    module_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    module_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    module_params = Column(TEXT, primary_key=False, nullable=True)


class Ly_nextnum(Base):
    __tablename__ = 'ly_nextnum'
    nn_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    nn_current = Column(INTEGER, primary_key=False, nullable=True)
    nn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    nn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_qry_fmw(Base):
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


class Ly_evt_dd(Base):
    __tablename__ = 'ly_evt_dd'
    evt_component = Column(VARCHAR(20), primary_key=True, nullable=False)
    evt_cpt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_dd_id = Column(VARCHAR(50), primary_key=True, nullable=False)
    evt_id = Column(INTEGER, primary_key=True, nullable=False)
    evt_act_id = Column(INTEGER, primary_key=False, nullable=False)
    evt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    evt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_themes(Base):
    __tablename__ = 'ly_themes'
    thm_id = Column(INTEGER, primary_key=True, nullable=False)
    thm_name = Column(VARCHAR(50), primary_key=False, nullable=False)
    thm_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    thm_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_tables(Base):
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


class Ly_tree(Base):
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


class Ly_thm_colors(Base):
    __tablename__ = 'ly_thm_colors'
    thm_id = Column(INTEGER, ForeignKey('ly_themes.thm_id'), primary_key=True, nullable=False)
    tcl_id = Column(INTEGER, primary_key=True, nullable=False)
    tcl_key = Column(VARCHAR(50), primary_key=False, nullable=False)
    tcl_light = Column(VARCHAR(100), primary_key=False, nullable=False)
    tcl_dark = Column(VARCHAR(100), primary_key=False, nullable=False)
    tcl_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    tcl_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_themes_rel = relationship('Ly_themes')


class Ly_cdn_params(Base):
    __tablename__ = 'ly_cdn_params'
    cdn_id = Column(INTEGER, ForeignKey('ly_condition.cdn_id'), primary_key=True, nullable=False)
    cdn_params_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_seq = Column(INTEGER, primary_key=False, nullable=False)
    cdn_dd_id = Column(VARCHAR(50), primary_key=False, nullable=False)
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
    ly_condition_rel = relationship('Ly_condition')


class Ly_lnk_val_l(Base):
    __tablename__ = 'ly_lnk_val_l'
    lnk_id = Column(INTEGER, ForeignKey('ly_lnk_val.lnk_id'), primary_key=True, nullable=False)
    val_id = Column(INTEGER, ForeignKey('ly_lnk_val.val_id'), primary_key=True, nullable=False)
    lng_id = Column(VARCHAR(4), primary_key=True, nullable=False)
    lng_label = Column(VARCHAR(40), primary_key=False, nullable=True)
    lng_link = Column(VARCHAR(250), primary_key=False, nullable=True)
    lng_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    lng_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_lnk_val_rel = relationship('Ly_lnk_val')


class Ly_menus_filters(Base):
    __tablename__ = 'ly_menus_filters'
    menu_seq_ukid = Column(VARCHAR(150), ForeignKey('ly_menus.menu_seq_ukid'), primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    ly_menus_rel = relationship('Ly_menus')


class Ly_usr_roles(Base):
    __tablename__ = 'ly_usr_roles'
    usr_id = Column(VARCHAR(30), ForeignKey('ly_users.usr_id'), primary_key=True, nullable=False)
    rol_id = Column(VARCHAR(30), ForeignKey('ly_roles.rol_id'), primary_key=True, nullable=False)
    rlu_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    rlu_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_users_rel = relationship('Ly_users')
    ly_roles_rel = relationship('Ly_roles')


class Ly_users(Base):
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


class Ly_tbl_col(Base):
    __tablename__ = 'ly_tbl_col'
    tbl_id = Column(INTEGER, ForeignKey('ly_tables.tbl_id'), primary_key=True, nullable=False)
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
    ly_tables_rel = relationship('Ly_tables')


class Ly_applications(Base):
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


class Ly_dsh_col(Base):
    __tablename__ = 'ly_dsh_col'
    dsh_id = Column(INTEGER, ForeignKey('ly_dashboard.dsh_id'), primary_key=True, nullable=False)
    dsh_col_id = Column(INTEGER, primary_key=True, nullable=False)
    dsh_display_title = Column(VARCHAR(1), primary_key=False, nullable=True)
    dsh_title = Column(VARCHAR(50), primary_key=False, nullable=True)
    dsh_row = Column(INTEGER, primary_key=False, nullable=True)
    dsh_column = Column(INTEGER, primary_key=False, nullable=True)
    dsh_component = Column(VARCHAR(20), primary_key=False, nullable=True)
    dsh_component_id = Column(INTEGER, primary_key=False, nullable=True)
    dsh_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    dsh_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_dashboard_rel = relationship('Ly_dashboard')


class Ly_dashboard(Base):
    __tablename__ = 'ly_dashboard'
    dsh_id = Column(INTEGER, primary_key=True, nullable=False)
    dsh_label = Column(VARCHAR(100), primary_key=False, nullable=True)
    dsh_row = Column(INTEGER, primary_key=False, nullable=True)
    dsh_column = Column(INTEGER, primary_key=False, nullable=True)
    dsh_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    dsh_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_act_tasks_params(Base):
    __tablename__ = 'ly_act_tasks_params'
    act_id = Column(INTEGER, ForeignKey('ly_act_tasks.act_id'), primary_key=True, nullable=False)
    evt_id = Column(INTEGER, ForeignKey('ly_act_tasks.evt_id'), primary_key=True, nullable=False)
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
    ly_act_tasks_rel = relationship('Ly_act_tasks')


class Ly_api_header(Base):
    __tablename__ = 'ly_api_header'
    api_id = Column(INTEGER, primary_key=True, nullable=False)
    hdr_id = Column(INTEGER, primary_key=True, nullable=False)
    hdr_key = Column(VARCHAR(100), primary_key=False, nullable=False)
    hdr_value = Column(VARCHAR(100), primary_key=False, nullable=False)
    hdr_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    hdr_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_api_params(Base):
    __tablename__ = 'ly_api_params'
    api_id = Column(INTEGER, primary_key=True, nullable=False)
    map_id = Column(INTEGER, primary_key=True, nullable=False)
    map_var = Column(VARCHAR(100), primary_key=False, nullable=False)
    map_value = Column(VARCHAR(100), primary_key=False, nullable=False)
    map_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    map_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_tbl_col_cdn(Base):
    __tablename__ = 'ly_tbl_col_cdn'
    tbl_id = Column(INTEGER, ForeignKey('ly_tables.tbl_id'), primary_key=True, nullable=False)
    col_id = Column(INTEGER, ForeignKey('ly_tbl_col.col_id'), primary_key=True, nullable=False)
    cdn_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    cdn_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    cdn_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    ly_tables_rel = relationship('Ly_tables')
    ly_tbl_col_rel = relationship('Ly_tbl_col')


class Ly_api(Base):
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


class Ly_dlg_col_cdn(Base):
    __tablename__ = 'ly_dlg_col_cdn'
    frm_id = Column(INTEGER, ForeignKey('ly_dlg_frm.frm_id'), primary_key=True, nullable=False)
    col_id = Column(INTEGER, ForeignKey('ly_dlg_col.col_id'), primary_key=True, nullable=False)
    cdn_id = Column(INTEGER, primary_key=True, nullable=False)
    cdn_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    cdn_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    cdn_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    cdn_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    cdn_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    ly_dlg_frm_rel = relationship('Ly_dlg_frm')
    ly_dlg_col_rel = relationship('Ly_dlg_col')


class Ly_act_params_filters(Base):
    __tablename__ = 'ly_act_params_filters'
    act_id = Column(INTEGER, ForeignKey('ly_act_params.act_id'), primary_key=True, nullable=False)
    map_var = Column(VARCHAR(50), ForeignKey('ly_act_params.map_var'), primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    ly_act_params_rel = relationship('Ly_act_params')


class Ly_tbl_filters(Base):
    __tablename__ = 'ly_tbl_filters'
    tbl_id = Column(INTEGER, ForeignKey('ly_tbl_col.tbl_id'), primary_key=True, nullable=False)
    col_id = Column(INTEGER, ForeignKey('ly_tbl_col.col_id'), primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    ly_tbl_col_rel = relationship('Ly_tbl_col')


class Ly_db_schema(Base):
    __tablename__ = 'ly_db_schema'
    sch_id = Column(INTEGER, primary_key=True, nullable=False)
    sch_pool = Column(VARCHAR(50), primary_key=False, nullable=True)
    sch_name = Column(VARCHAR(30), primary_key=False, nullable=True)
    sch_target = Column(VARCHAR(30), primary_key=False, nullable=True)
    sch_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    sch_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)


class Ly_dictionary_filters(Base):
    __tablename__ = 'ly_dictionary_filters'
    dd_id = Column(VARCHAR(50), ForeignKey('ly_dictionary.dd_id'), primary_key=True, nullable=False)
    flt_id = Column(INTEGER, primary_key=True, nullable=False)
    flt_type = Column(VARCHAR(10), primary_key=False, nullable=True)
    flt_source = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_target = Column(VARCHAR(50), primary_key=False, nullable=True)
    flt_audit_user = Column(VARCHAR(30), primary_key=False, nullable=True)
    flt_audit_date = Column(TIMESTAMP, primary_key=False, nullable=True)
    flt_value = Column(VARCHAR(50), primary_key=False, nullable=True)
    ly_dictionary_rel = relationship('Ly_dictionary')


class Databasechangeloglock(Base):
    __tablename__ = 'databasechangeloglock'
    id = Column(INTEGER, primary_key=True, nullable=False)
    locked = Column(BOOLEAN, primary_key=False, nullable=False)
    lockgranted = Column(TIMESTAMP, primary_key=False, nullable=True)
    lockedby = Column(VARCHAR(255), primary_key=False, nullable=True)


class Ly_charts(Base):
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



def liberty_get_insert_columns():
    """Stored Procedure: get_insert_columns (Schema: liberty)"""
    pass

def liberty_get_query_columns():
    """Stored Procedure: get_query_columns (Schema: liberty)"""
    pass

def liberty_create_application():
    """Stored Procedure: create_application (Schema: liberty)"""
    pass
