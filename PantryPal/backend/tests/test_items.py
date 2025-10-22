import pytest
from datetime import datetime
from app.models.item import ItemCategory

def get_unique_name(base_name: str) -> str:
    """Generate a unique item name using timestamp."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    return f"{base_name}_{timestamp}"

def test_list_items(client, admin_credentials):
    """Test listing items (empty initially)."""
    # Login to get token
    resp = client.post(
        "/api/auth/login",
        data={"username": admin_credentials["username"], "password": admin_credentials["password"]},
    )
    assert resp.status_code == 200
    token = resp.json().get("access_token")
    assert token

    # List items (should be empty initially)
    resp = client.get("/api/items", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    items = resp.json()
    assert isinstance(items, list)

def test_create_and_get_item(client, admin_credentials):
    """Test creating an item and retrieving it."""
    # Login
    resp = client.post(
        "/api/auth/login",
        data={"username": admin_credentials["username"], "password": admin_credentials["password"]},
    )
    token = resp.json()["access_token"]

    # Create item
    item_data = {
        "name": get_unique_name("Test Apple"),
        "description": "Fresh red apple",
        "category": ItemCategory.PRODUCE.value,
        "unit_of_measure": "piece",
        "par_level": 10,
        "current_quantity": 5
    }
    resp = client.post(
        "/api/items",
        headers={"Authorization": f"Bearer {token}"},
        json=item_data
    )
    assert resp.status_code == 200
    created = resp.json()
    assert created["name"] == item_data["name"]
    assert created["category"] == item_data["category"]
    assert isinstance(created["id"], str)
    
    # Get by ID
    item_id = created["id"]
    resp = client.get(
        f"/api/items/{item_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    item = resp.json()
    assert item["id"] == item_id
    assert item["name"] == item_data["name"]

def test_update_item(client, admin_credentials):
    """Test updating an item."""
    # Login
    resp = client.post(
        "/api/auth/login",
        data={"username": admin_credentials["username"], "password": admin_credentials["password"]},
    )
    token = resp.json()["access_token"]

    # Create item first
    item_data = {
        "name": get_unique_name("Test Orange"),
        "description": "Fresh orange",
        "category": ItemCategory.PRODUCE.value,
        "unit_of_measure": "piece",
        "par_level": 15,
        "current_quantity": 8
    }
    resp = client.post(
        "/api/items",
        headers={"Authorization": f"Bearer {token}"},
        json=item_data
    )
    item_id = resp.json()["id"]

    # Update item
    update_data = {
        "description": "Updated description",
        "par_level": 20,
        "current_quantity": 12
    }
    resp = client.put(
        f"/api/items/{item_id}",
        headers={"Authorization": f"Bearer {token}"},
        json=update_data
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["id"] == item_id
    assert updated["description"] == update_data["description"]
    assert updated["par_level"] == update_data["par_level"]
    assert updated["current_quantity"] == update_data["current_quantity"]
    # Original fields unchanged
    assert updated["name"] == item_data["name"]
    assert updated["category"] == item_data["category"]

def test_delete_item(client, admin_credentials):
    """Test deleting an item."""
    # Login
    resp = client.post(
        "/api/auth/login",
        data={"username": admin_credentials["username"], "password": admin_credentials["password"]},
    )
    token = resp.json()["access_token"]

    # Create item to delete
    item_data = {
        "name": get_unique_name("Test Banana"),
        "description": "Yellow banana",
        "category": ItemCategory.PRODUCE.value,
        "unit_of_measure": "piece",
        "par_level": 12,
        "current_quantity": 6
    }
    resp = client.post(
        "/api/items",
        headers={"Authorization": f"Bearer {token}"},
        json=item_data
    )
    item_id = resp.json()["id"]

    # Delete item
    resp = client.delete(
        f"/api/items/{item_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200

    # Verify get returns 404
    resp = client.get(
        f"/api/items/{item_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 404

def test_low_stock_items(client, admin_credentials):
    """Test listing low stock items."""
    # Login
    resp = client.post(
        "/api/auth/login",
        data={"username": admin_credentials["username"], "password": admin_credentials["password"]},
    )
    token = resp.json()["access_token"]

    # Create items with various stock levels
    items_data = [
        {
            "name": get_unique_name("Low Stock Item"),
            "description": "Below par level",
            "category": ItemCategory.PRODUCE.value,
            "unit_of_measure": "piece",
            "par_level": 10,
            "current_quantity": 5  # Below par
        },
        {
            "name": get_unique_name("Good Stock Item"),
            "description": "Above par level",
            "category": ItemCategory.PRODUCE.value,
            "unit_of_measure": "piece",
            "par_level": 10,
            "current_quantity": 15  # Above par
        }
    ]
    
    for item_data in items_data:
        resp = client.post(
            "/api/items",
            headers={"Authorization": f"Bearer {token}"},
            json=item_data
        )
        assert resp.status_code == 200

    # Check low stock endpoint
    resp = client.get(
        "/api/items/low-stock",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    low_stock = resp.json()
    assert isinstance(low_stock, list)
    assert any('Low Stock Item' in item["name"] for item in low_stock)
    assert not any('Good Stock Item' in item["name"] for item in low_stock)