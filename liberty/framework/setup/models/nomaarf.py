"""Auto-generated SQLAlchemy models."""

from sqlalchemy import BOOLEAN, INTEGER, TEXT, TIMESTAMP, VARCHAR, BIGINT, DATE, REAL, Column, Integer, String, ForeignKey, Boolean, DateTime, Float, Text, ForeignKeyConstraint, Index, UniqueConstraint
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class DwhEtl(Base):
    __tablename__ = 'dwh_etl'
    dwh_apps_id = Column(INTEGER, primary_key=True, nullable=False)
    dwh_type = Column(VARCHAR(3), primary_key=True, nullable=False)
    dwh_instance = Column(VARCHAR(5), primary_key=True, nullable=False)
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
    dwh_ctrl_auto = Column(VARCHAR(1), primary_key=False, nullable=True)


