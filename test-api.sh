#!/bin/bash

# Perpetest - API Testing Script
# Run with: chmod +x test-api.sh && ./test-api.sh

API_URL="http://localhost:3000/api"
PYTHON_RECOMMENDATION="http://localhost:8001"
PYTHON_DELIVERY="http://localhost:8002"

echo "🧪 Testing Perpetest API"
echo "========================"

# Health Checks
echo ""
echo "1️⃣  Health Checks"
echo "-----------------"

echo "✓ Backend Health:"
curl -s "${API_URL}/health" | jq .

echo ""
echo "✓ Recommendation Service Health:"
curl -s "${PYTHON_RECOMMENDATION}/health" | jq .

echo ""
echo "✓ Delivery Service Health:"
curl -s "${PYTHON_DELIVERY}/health" | jq .

# Catalog
echo ""
echo ""
echo "2️⃣  Catalog Tests"
echo "-----------------"

echo "✓ Get Species:"
curl -s "${API_URL}/catalog/species" | jq '.data | length'

echo ""
echo "✓ Get Products:"
curl -s "${API_URL}/catalog/products" | jq '.data | length'

echo ""
echo "✓ Get Bundles:"
curl -s "${API_URL}/catalog/bundles" | jq '.data | length'

# Create Project
echo ""
echo ""
echo "3️⃣  Projects Test"
echo "-----------------"

CUSTOMER_ID="customer-test-$(date +%s)"
echo "Creating test customer with ID: $CUSTOMER_ID"

PROJECT_DATA=$(cat <<EOF
{
  "customerId": "$CUSTOMER_ID",
  "name": "Teste Restauração",
  "biome": "Mata Atlântica",
  "areaSizeHa": 5.0,
  "objective": "APP",
  "latitude": -23.5505,
  "longitude": -46.6333
}
EOF
)

PROJECT_RESPONSE=$(curl -s -X POST "${API_URL}/projects" \
  -H "Content-Type: application/json" \
  -d "$PROJECT_DATA")

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.data.project.id')
CART_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.data.cart.id')

echo "✓ Project created: $PROJECT_ID"
echo "✓ Cart created: $CART_ID"

# Add to Cart
echo ""
echo ""
echo "4️⃣  Cart Tests"
echo "---------------"

# Get first product
PRODUCT_ID=$(curl -s "${API_URL}/catalog/products" | jq -r '.data[0].id')

echo "Adding product $PRODUCT_ID to cart..."

curl -s -X POST "${API_URL}/cart/${CART_ID}/items" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 100
  }" | jq '.data.cart.items | length'

# Get Cart
echo ""
echo "✓ Getting cart:"
curl -s "${API_URL}/cart/${CART_ID}" | jq '.data.items | length'

# Pricing Quote
echo ""
echo ""
echo "5️⃣  Pricing Tests"
echo "-----------------"

echo "✓ Getting quote:"
curl -s -X POST "${API_URL}/pricing/quote" \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [
      {
        \"productId\": \"$PRODUCT_ID\",
        \"quantity\": 100
      }
    ]
  }" | jq '.data'

# Checkout Prepare
echo ""
echo ""
echo "6️⃣  Checkout Tests"
echo "------------------"

echo "✓ Preparing checkout:"
CHECKOUT_PREP=$(curl -s -X POST "${API_URL}/checkout/prepare" \
  -H "Content-Type: application/json" \
  -d "{
    \"cartId\": \"$CART_ID\",
    \"deliveryAddress\": \"Rua Principal, 123 - São Paulo\",
    \"deliveryLat\": -23.5505,
    \"deliveryLon\": -46.6333
  }")

echo "$CHECKOUT_PREP" | jq '.data.shippingOptions'

# Recommendation Service
echo ""
echo ""
echo "7️⃣  Recommendation Tests"
echo "------------------------"

echo "✓ Getting project recommendations:"
curl -s -X POST "${PYTHON_RECOMMENDATION}/recommendations/projects/${PROJECT_ID}" | jq '.recommendations'

# Delivery Service
echo ""
echo ""
echo "8️⃣  Delivery Service Tests"
echo "---------------------------"

echo "✓ Getting delivery quote:"
curl -s -X POST "${PYTHON_DELIVERY}/delivery/quote" \
  -H "Content-Type: application/json" \
  -d "{
    \"originLat\": -23.5505,
    \"originLon\": -46.6333,
    \"destinationLat\": -23.6000,
    \"destinationLon\": -46.7000,
    \"volume\": 100.0,
    \"weight\": 50.0,
    \"itemsCount\": 100
  }" | jq '.options'

# Final Status
echo ""
echo ""
echo "✅ All tests completed!"
echo "🔧 For detailed responses, remove the 'jq' filter"
