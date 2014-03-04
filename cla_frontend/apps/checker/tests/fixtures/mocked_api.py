CATEGORY_LIST = [{
    "code": "immigration",
    "description": "",
    "name": "Immigration",
},
{
    "code": "abuse",
    "description": "",
    "name": "Domestic abuse",
},
{
    "code": "consumer",
    "description": "",
    "name": "Consumer",
},
{
    "code": "debt",
    "description": "You may be able to get legal aid if:\r\nYou owe money to someone who is threatening you with bankruptcy\r\nYou owe money to an individual or a mortgage lender which is putting your home at risk",
    "name": "Debt, money problems and bankruptcy",
}]


ELIGIBILITY_CHECK_CREATE = {
    'reference': '1234567890',
    'category': 'debt',
    'notes': 'lorem ipsum'
}

ELIGIBILITY_CHECK_CREATE_FROM_YOUR_FINANCES = {
    "reference": "1d37cc19063f4f069f374c4c0aad54d2",
    "category": None,
    "notes": "",
    "property_set": [
        {
            "value": 100000,
            "mortgage_left": 50000,
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
        "self_employed": False,

        "income_tax_and_ni": 0,
        "maintenance": 0,
        "mortgage_or_rent": 0,
        "criminal_legalaid_contributions": 0
    },
    "partner_finances": {
        "bank_balance": 100,
        "investment_balance": 100,
        "asset_balance": 100,
        "credit_balance": 100,
        "earnings": 100,
        "other_income": 100,
        "self_employed": False,

        "income_tax_and_ni": 0,
        "maintenance": 0,
        "mortgage_or_rent": 0,
        "criminal_legalaid_contributions": 0
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
            "mortgage_left": 50000,
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
        "self_employed": False,

        "income_tax_and_ni": 0,
        "maintenance": 0,
        "mortgage_or_rent": 0,
        "criminal_legalaid_contributions": 0
    },
    "partner_finances": {
        "bank_balance": 100,
        "investment_balance": 100,
        "asset_balance": 100,
        "credit_balance": 100,
        "earnings": 100,
        "other_income": 100,
        "self_employed": False,

        "income_tax_and_ni": 0,
        "maintenance": 0,
        "mortgage_or_rent": 0,
        "criminal_legalaid_contributions": 0
    },
    "dependants_young": 0,
    "dependants_old": 0
}

ELIGIBILITY_CHECK_DISPOSABLE_INCOME_YOUR_FINANCES = {
    "reference": "1d37cc19063f4f069f374c4c0aad54d2",
    "category": None,
    "notes": "",
    "property_set": [],
    "your_finances": {
        "bank_balance": 0,
        "investment_balance": 0,
        "asset_balance": 0,
        "credit_balance": 0,
        "earnings": 0,
        "other_income": 0,
        "self_employed": False,

        "income_tax_and_ni": 700,
        "maintenance": 710,
        "mortgage_or_rent": 720,
        "criminal_legalaid_contributions": 730
    },
    "partner_finances": {
        "bank_balance": 0,
        "investment_balance": 0,
        "asset_balance": 0,
        "credit_balance": 0,
        "earnings": 0,
        "other_income": 0,
        "self_employed": False,

        "income_tax_and_ni": 0,
        "maintenance": 0,
        "mortgage_or_rent": 0,
        "criminal_legalaid_contributions": 0
    },
    "dependants_young": 0,
    "dependants_old": 0
}

ELIGIBILITY_CHECK_CREATE_CASE = {
    "eligibility_check": "1d37cc19063f4f069f374c4c0aad54d2",
    "personal_details": {
        "title": "mr",
        "full_name": "John Doe",
        "postcode": "SW1H 9AJ",
        "street": "102 Petty France",
        "town": "London",
        "mobile_phone": "0123456789",
        "home_phone": "9876543210"
    },
    "reference": "LA-2954-3453"
}

IS_ELIGIBLE_TRUE = {
    'is_eligible': True
}

IS_ELIGIBLE_FALSE = {
    'is_eligible': False
}
