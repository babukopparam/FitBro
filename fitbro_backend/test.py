from fitbro_backend.database import engine
from fitbro_backend.models import Base
from sqlalchemy import inspect, text

print("---- DROPPING all tables ----")
Base.metadata.drop_all(bind=engine)
print("---- All tables dropped successfully ----")

print("---- CREATING all tables ----")
Base.metadata.create_all(bind=engine)
print("---- All tables created successfully ----\n")

# Print tables from SQLAlchemy metadata
print("Base.metadata.tables.keys():", list(Base.metadata.tables.keys()))

# Print tables from the actual DB engine (inspector)
inspector = inspect(engine)
table_names = inspector.get_table_names()
print("inspector.get_table_names():", table_names)

# Print tables by querying SQLite master directly
with engine.connect() as conn:
    tables = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';")).fetchall()
    print("Tables from sqlite_master:", [row[0] for row in tables])
