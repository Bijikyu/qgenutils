# Frontend Demo Guide: Registration, Catalog, Cart & Checkout

This repository includes a self-contained HTML demo to exercise core e-commerce user flows entirely in the browser without a backend. It demonstrates:

- User registration and sign-in state (localStorage-based)
- Product catalog with add-to-cart interactions
- Shopping cart management (quantity updates, removal)
- Checkout form validation and order creation (client-side simulation)
- Simple order history view persisted in localStorage

How to use
- Open the demo in a browser by loading `demo.html` from the repository root. No server is required for basic testing.
- You can also host the file locally with a tiny static server if you want to simulate a real environment. For example:
  - `npx http-server -p 8080` and then visit `http://localhost:8080/demo.html`.

What to expect
- All data persists in `localStorage` for the duration of the browser session unless you clear storage or reset the demo.
- The UI is intentionally lightweight and self-contained; it does not depend on Bun or any backend services.

Testing flows (manual)
1. Registration
   - Use the Registration panel to enter a name and email, then sign up.
   - You should see a greeting or sign-out option indicating you are signed in.
2. Catalog
   - Browse products. Click Add to cart to place items into the cart.
   - Switch to the Cart view to adjust quantities or remove items.
3. Checkout
   - From Cart, click Proceed to Checkout or go to Checkout directly.
   - Complete address and payment fields (mock) and place the order.
   - You should see a success toast and a new entry in Orders.
4. Orders
   - Open Orders to review past orders created during checkout.
5. Reset
   - Use the Reset Demo button to clear localStorage and start fresh.

Notes
- This is a functional frontend-only demo intended for testing UI flows; it is not a real shopping backend.
- If you modify the demo, ensure you refresh the page to re-sync UI state with storage.
