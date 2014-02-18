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

ELIGIBILITY_CHECK_CREATE_FROM_YOUR_FINANCES = {
    "reference": "1d37cc19063f4f069f374c4c0aad54d2",
    "category": None,
    "notes": "",
    "property_set": [
        {
            "value": 100000,
            "equity": 50000,
            "share": 100,
            "id": 76
        }
    ],
    "your_finances": {
        "bank_balance": 100,
        "investment_balance": 100,
        "asset_balance": 100,
        "credit_balance": 100,
        "earnings": 100,
        "other_income": 100,
        "self_employed": False
    },
    "partner_finances": {
        "bank_balance": 100,
        "investment_balance": 100,
        "asset_balance": 100,
        "credit_balance": 100,
        "earnings": 100,
        "other_income": 100,
        "self_employed": False
    },
    "dependants_young": 0,
    "dependants_old": 0
}

ELIGIBILITY_CHECK_UPDATE_FROM_YOUR_FINANCES = {
    "reference": "1d37cc19063f4f069f374c4c0aad54d2",
    "category": None,
    "notes": "",
    "property_set": [
        {
            "value": 100000,
            "equity": 50000,
            "share": 100,
            "id": 76
        }
    ],
    "your_finances": {
        "bank_balance": 100,
        "investment_balance": 100,
        "asset_balance": 100,
        "credit_balance": 100,
        "earnings": 100,
        "other_income": 100,
        "self_employed": False
    },
    "partner_finances": {
        "bank_balance": 100,
        "investment_balance": 100,
        "asset_balance": 100,
        "credit_balance": 100,
        "earnings": 100,
        "other_income": 100,
        "self_employed": False
    },
    "dependants_young": 0,
    "dependants_old": 0
}

