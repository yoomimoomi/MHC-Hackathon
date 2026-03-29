import pandas as pd
from sodapy import Socrata

# 1. Connect to the NYC Open Data domain
# No app_token is required for public data, but it's recommended for higher rate limits
client = Socrata("data.cityofnewyork.us", None)

# 2. Fetch the data
# Results are returned as a list of dictionaries
# results = client.get("43nn-pn8j", limit=1000)

# results = client.query("SELECT * FROM 43nn-pn8j LIMIT 1000")
# 3. Convert to a Pandas DataFrame for analysis
# df = pd.DataFrame.from_records(results)

# print(df.head())


def _soql_string(value: str) -> str:
    """Escape a Python string for use inside a SoQL single-quoted literal."""
    return str(value).replace("'", "''")


def get_data(record_id: str, client: Socrata):
    """Fetch rows where `dba` matches `record_id` (Liquor Authority dataset)."""
    # SoQL: string literals use single quotes; column name from API is typically lowercase `dba`
    where = f"dba = '{_soql_string(record_id)}'"
    results = client.get(
        "43nn-pn8j",
        limit=1,
        where=where,
    )
    results_frame = pd.DataFrame.from_records(results)
    grade = results_frame["grade"]
    print(grade)
    # return results


if __name__ == "__main__":
    get_data("POLANCO RESTAURANT BBQ", client)
    
    
