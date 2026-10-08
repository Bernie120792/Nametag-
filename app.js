const CART_KEY = "nova_store_cart";

function peso(value) {
  return "₱" + Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("Cart read error:", error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = count;
  });
}

function addToCart(productId) {
  if (!PRODUCTS[productId]) return;

  const cart = getCart();
  const existing = cart.find(item => item.productId === productId);

  if (existing) {
    existing.quantity = Math.min(99, Number(existing.quantity) + 1);
  } else {
    cart.push({ productId, quantity: 1 });
  }

  saveCart(cart);
  toast(PRODUCTS[productId].name + " added to cart.");
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(x => x.productId === productId);
  if (!item) return;

  item.quantity = Number(item.quantity) + delta;

  if (item.quantity <= 0) {
    return removeFromCart(productId);
  }

  item.quantity = Math.min(99, item.quantity);
  saveCart(cart);
  renderCart();
  renderCheckout();
}

function removeFromCart(productId) {
  saveCart(getCart().filter(item => item.productId !== productId));
  renderCart();
  renderCheckout();
}

function cartTotal() {
  return getCart().reduce((total, item) => {
    const product = PRODUCTS[item.productId];
    return product ? total + product.price * Number(item.quantity) : total;
  }, 0);
}

function renderProducts() {
  const grid = document.querySelector("[data-products]");
  if (!grid) return;

  grid.innerHTML = Object.entries(PRODUCTS).map(([id, product]) => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <div class="product-title-row">
          <h3>${product.name}</h3>
          <strong>${peso(product.price)}</strong>
        </div>
        <p>${product.description}</p>
        <button class="btn btn-primary" onclick="addToCart('${id}')">Add to cart</button>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const box = document.querySelector("[data-cart]");
  if (!box) return;

  const cart = getCart();

  if (!cart.length) {
    box.innerHTML = `
      <div class="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add something from our products to continue.</p>
        <a class="btn btn-primary" href="./products.html">Shop products</a>
      </div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="cart-list">
      ${cart.map(item => {
        const product = PRODUCTS[item.productId];
        if (!product) return "";

        return `
          <div class="cart-item">
            <img src="${product.image}" alt="${product.name}">
            <div class="cart-item-main">
              <h3>${product.name}</h3>
              <p>${peso(product.price)} each</p>
              <div class="qty">
                <button onclick="changeQty('${item.productId}', -1)">−</button>
                <span>${item.quantity}</span>
                <button onclick="changeQty('${item.productId}', 1)">+</button>
              </div>
            </div>
            <div class="cart-item-side">
              <strong>${peso(product.price * item.quantity)}</strong>
              <button class="remove" onclick="removeFromCart('${item.productId}')">Remove</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>

    <div class="cart-summary">
      <span>Total</span>
      <strong>${peso(cartTotal())}</strong>
    </div>

    <a class="btn btn-primary full" href="./checkout.html">Proceed to checkout</a>
  `;
}

function renderCheckout() {
  const box = document.querySelector("[data-checkout-items]");
  const total = document.querySelector("[data-checkout-total]");
  const button = document.querySelector("#payButton");
  if (!box || !total) return;

  const cart = getCart();

  if (!cart.length) {
    box.innerHTML = `<p class="muted">Your cart is empty.</p>`;
    total.textContent = peso(0);
    if (button) button.disabled = true;
    return;
  }

  if (button) button.disabled = false;

  box.innerHTML = cart.map(item => {
    const product = PRODUCTS[item.productId];
    if (!product) return "";

    return `
      <div class="checkout-line">
        <div>
          <strong>${product.name}</strong>
          <span>Qty ${item.quantity}</span>
        </div>
        <strong>${peso(product.price * item.quantity)}</strong>
      </div>
    `;
  }).join("");

  total.textContent = peso(cartTotal());
}

// ---------------------------------------------------------
// PAYMONGO CHECKOUT
// ---------------------------------------------------------
async function startPayment() {
  const endpoint = window.APP_CONFIG && window.APP_CONFIG.APPS_SCRIPT_URL;

  if (!endpoint) {
    throw new Error("Checkout config is missing. Check config.js.");
  }

  const cart = getCart();

  if (!cart.length) {
    throw new Error("Your cart is empty.");
  }

  const items = cart.map(item => ({
    productId: String(item.productId),
    quantity: Number(item.quantity)
  }));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({ items })
    });

    // Read as text first. This prevents:
    // Unexpected token '<', "<!DOCTYPE..."
    const responseText = await response.text();

    console.log("PayMongo backend status:", response.status);
    console.log("PayMongo backend response:", responseText);

    if (!responseText.trim()) {
      throw new Error("The checkout server returned an empty response.");
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Non-JSON checkout response:", responseText);

      if (responseText.trim().startsWith("<!DOCTYPE") || responseText.includes("<html")) {
        throw new Error(
          "The Apps Script Web App returned an HTML page instead of JSON. " +
          "Check that the deployed Web App is accessible to Anyone and that " +
          "the current /exec URL is used in config.js."
        );
      }

      throw new Error("Invalid response from the checkout server.");
    }

    if (!data.ok) {
      throw new Error(data.error || "Unable to create PayMongo checkout.");
    }

    if (!data.checkout_url) {
      throw new Error("PayMongo did not return a checkout URL.");
    }

    window.location.href = data.checkout_url;

  } catch (error) {
    console.error("Checkout error:", error);
    throw error;
  }
}

function toast(message) {
  let el = document.querySelector(".toast");

  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }

  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1800);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderProducts();
  renderCart();
  renderCheckout();
});
