CATEGORY_LIST = [{
    "id": 1,
    "description": "",
    "name": "Immigration",
},
{
    "id": 2,
    "description": "",
    "name": "Domestic abuse",
},
{
    "id": 3,
    "description": "",
    "name": "Consumer",
},
{
    "id": 4,
    "description": "You may be able to get legal aid if:\r\nYou owe money to someone who is threatening you with bankruptcy\r\nYou owe money to an individual or a mortgage lender which is putting your home at risk",
    "name": "Debt, money problems and bankruptcy",
}]


ELIGIBILITY_CHECK_CREATE = {
    'reference': '1234567890',
    'category': '1',
    'notes': 'lorem ipsum'
}

ELIGIBILITY_CHECK_UPDATE = {
    "reference": "a0cee53ed5d84410826fe4fb7f294803",
    "category": 1,
    "notes": "ggrsg",
    "property_set": [
        {
            "value": 345,
            "equity": 0,
            "share": 14,
            "id": 9
        }
    ],
    "your_finances": {
        "bank_balance": 345,
        "investment_balance": 3453,
        "asset_balance": 345,
        "credit_balance": 345,
        "earnings": 435,
        "other_income": 345,
        "self_employed": False
    },
    "partner_finances": {
        "bank_balance": 345,
        "investment_balance": 345,
        "asset_balance": 345,
        "credit_balance": 34,
        "earnings": 345,
        "other_income": 345,
        "self_employed": False
    },
    "dependants_young": 0,
    "dependants_old": 0
}
