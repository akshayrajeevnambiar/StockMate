import os

def test_root(client):
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "message" in data


def test_login_and_me(client, admin_credentials):
    # Login using form fields similar to OAuth2PasswordRequestForm
    resp = client.post(
        "/api/auth/login",
        data={"username": admin_credentials["username"], "password": admin_credentials["password"]},
    )
    assert resp.status_code == 200, resp.text
    token = resp.json().get("access_token")
    assert token, "access_token missing from login response"

    # Access /me with token
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200, me.text
    me_data = me.json()
    assert me_data.get("email") == admin_credentials["username"]
