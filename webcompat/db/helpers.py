from webcompat import app
from webcompat.db import issue_db
from webcompat.db import WCIssue


def row_to_dict(row):
    d = {}
    for column in row.__table__.columns:
        d[column.name] = str(getattr(row, column.name))
    return d


def domain_search(search_domain):
    '''Returns the ten most recent issues with a similar domain name'''
    search_domain += "%"
    session = issue_db()
    query_result = (
        session.query(WCIssue)
        .filter(WCIssue.domain.like(search_domain))
        .limit(10).all()
        )
    result_dict = []
    for r in query_result:
        result_dict.append(row_to_dict(r))
    return result_dict
