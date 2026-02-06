from dotenv import load_dotenv
from flask import Flask, render_template, redirect, url_for, session
import os
from identity.flask import Auth
import app_config


load_dotenv()

def _require_env(name: str) -> str:
    """
    Retrieve a required environment variable.

    Raises:
        RuntimeError: If the environment variable is not set.
    """
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


class Config:
    """
    Centralized application and Azure AD configuration.
    """

    CLIENT_ID = _require_env("MS_CLIENT_ID")
    CLIENT_SECRET = _require_env("MS_CLIENT_SECRET")
    TENANT_ID = _require_env("MS_TENANT_ID")
    REDIRECT_URI = _require_env("MS_REDIRECT_URI")
    FLASK_SECRET_KEY = _require_env("FLASK_SECRET_KEY")
    AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
    BACKEND_SCOPE =  _require_env("BACKEND_SCOPE")
    FRONTEND_SCOPE = _require_env("FRONTEND_SCOPE")


app = Flask(__name__)
app.config.from_object(app_config)
app.secret_key = Config.FLASK_SECRET_KEY


auth = Auth(
    app=app,
    client_id=Config.CLIENT_ID,
    client_credential=Config.CLIENT_SECRET,
    authority=Config.AUTHORITY,
    redirect_uri=Config.REDIRECT_URI,
)

def build_msal_app():
    import msal
    return msal.ConfidentialClientApplication(
        client_id=Config.CLIENT_ID,
        client_credential=Config.CLIENT_SECRET,
        authority=Config.AUTHORITY,
    )

@app.route("/silas/", methods=["GET", "POST"])
@auth.login_required(scopes=[Config.BACKEND_SCOPE])
def access_token_route(*, context):

    data = context.get("user")
    name = data.get("name")
    access_token = context.get("access_token")
    print("ACCESS TOKEN:", context.get("access_token"))
    return render_template("dashboard.html", name=name, access_token=access_token)

@app.route("/silas/obo", methods=["GET", "POST"])
@auth.login_required(scopes=[Config.FRONTEND_SCOPE])
def obo_route(*, context):


    data = context.get("user")
    name = data.get("name")
    access_token = context.get("access_token")
    print("ACCESS TOKEN:", access_token)
    print("Getting obo token...")
    msal_app = build_msal_app()
    result = msal_app.acquire_token_on_behalf_of(access_token, [Config.BACKEND_SCOPE])
    if "error" in result:
        raise RuntimeError(result["error_description"])
    obo_token = result.get("access_token")
    obo_token_expires_in = result.get("expires_in")
    print("OBO TOKEN:", obo_token)
    print("OBO TOKEN EXPIRES IN :", obo_token_expires_in)


    return render_template("dashboard.html", name=name, access_token=access_token, obo_token=obo_token, obo_token_expires_in=obo_token_expires_in)


if __name__ == "__main__":
    app.run(debug=True)
