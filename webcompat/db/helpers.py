from webcompat import app
from webcompat.db import issue_db
from webcompat.db import WCIssue


def domain_search(search_domain):
    '''Returns the ten most recent issues with a similar domain name'''
    search_domain += "%"
    session = issue_db()
    query = (
        session.query(WCIssue)
        .filter(WCIssue.domain.like(search_domain))
        .limit(10).all()
        )
    result_dict = []
    for row in query:
        d = {}
        for column in row.__table__.columns:
            d[column.name] = str(getattr(row, column.name))
        result_dict.append(d)
    return result_dict
