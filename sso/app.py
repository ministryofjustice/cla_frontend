from dotenv import load_dotenv
from flask import Flask, render_template, redirect, url_for, session
import os
import msal
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
    GRAPH_SCOPES = ["https://graph.microsoft.com/.default"]
    BACKEND_SCOPE =  _require_env("BACKEND_SCOPE")


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
    return msal.ConfidentialClientApplication(
        client_id=Config.CLIENT_ID,
        client_credential=Config.CLIENT_SECRET,
        authority=Config.AUTHORITY,
    )

@app.route("/", methods=["GET", "POST"])
@auth.login_required(scopes=Config.GRAPH_SCOPES)
def home(*, context):

    data = context.get("user")
    name = data.get("name")
    print("ACCESS TOKEN:", context.get("access_token"))
    print("GENERATING OBO TOKEN......" )
    obo_result = build_msal_app().acquire_token_on_behalf_of(
        user_assertion=context["access_token"],
        scopes=[Config.BACKEND_SCOPE],
    )
    if "error" in obo_result:
        raise RuntimeError(obo_result["error_description"])
    else:
        print("OBO TOKEN:", obo_result)

    return render_template("dashboard.html", context=name)


@app.route("/login", methods=["GET", "POST"])
def login():

    return render_template("login.html")


@app.route("/dashboard")
@auth.login_required(scopes=Config.GRAPH_SCOPES)
def dashboard(*, context):
    user = context.get("user")

    name = user.get("name", "Guest")
    email = user.get("preferred_username") or user.get("email") or "Guest"

    return render_template("dashboard.html", name=name, email=email)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(debug=True)
