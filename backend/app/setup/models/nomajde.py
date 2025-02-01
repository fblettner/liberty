"""Auto-generated SQLAlchemy models."""

from sqlalchemy import BOOLEAN, INTEGER, TEXT, TIMESTAMP, VARCHAR, BIGINT, DATE, REAL, Column, Integer, String, ForeignKey, Boolean, DateTime, Float, Text, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Databasechangeloglock(Base):
    __tablename__ = 'databasechangeloglock'
    id = Column(INTEGER, primary_key=True, nullable=False)
    locked = Column(BOOLEAN, primary_key=False, nullable=False)
    lockgranted = Column(TIMESTAMP, primary_key=False, nullable=True)
    lockedby = Column(VARCHAR(255), primary_key=False, nullable=True)


