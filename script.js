let balance = 100000000000;
let totalSpent = 0;
let cart = {};

const checkoutBtn = document.getElementById("checkout-btn");
const checkoutModal = document.getElementById("checkout-modal");
const closeModalBtn = document.getElementById("close-modal");
const resetBtn = document.getElementById("reset-btn");
const checkoutItemsElement = document.getElementById("checkout-items");
const checkoutTotalElement = document.getElementById("checkout-total");
const balanceElement = document.getElementById("balance");
const itemsContainer = document.getElementById("items-container");
const cartElement = document.getElementById("cart");
const totalSpentElement = document.getElementById("total-spent");
const progressBar = document.getElementById("progress-bar");

fetch("items.json")
    .then(response => response.json())
    .then(items => {
        items.forEach(item => createItemCard(item));
    })
    .catch(error => console.error("Error loading items:", error));

// Function to format amounts (K, M, B) for receipt only
function formatAmount(amount) {
    if (amount >= 1e9) {
        return (amount / 1e9).toFixed(2) + 'B'; // Billion
    } else if (amount >= 1e6) {
        return (amount / 1e6).toFixed(2) + 'M'; // Million
    } else if (amount >= 1e3) {
        return (amount / 1e3).toFixed(0) + 'K'; // Thousand
    } else {
        return amount; // Less than 1K
    }
}

function createItemCard(item) {
    const div = document.createElement("div");
    div.className = "item";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;

    const name = document.createElement("p");
    name.className = "item-name";
    name.textContent = item.name;

    const price = document.createElement("p");
    price.className = "item-price";
    price.textContent = `AED ${item.price.toLocaleString()}`;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.value = "1";

    const btn = document.createElement("button");
    btn.textContent = "Buy";
    btn.onclick = () => buyItem(item, input.value);

    div.appendChild(img);
    div.appendChild(name);
    div.appendChild(price);
    div.appendChild(input);
    div.appendChild(btn);
    itemsContainer.appendChild(div);
}

function buyItem(item, quantity) {
    quantity = parseInt(quantity) || 1;
    let totalCost = item.price * quantity;

    if (balance >= totalCost) {
        let currentBalance = balance;
        let newBalance = balance - totalCost;
        let decreaseAmount = Math.ceil((currentBalance - newBalance) / 50); // Smooth decrease steps

        let balanceInterval = setInterval(() => {
            if (currentBalance > newBalance) {
                currentBalance -= decreaseAmount;
                if (currentBalance < newBalance) {
                    currentBalance = newBalance;
                }
                balanceElement.textContent = currentBalance.toLocaleString();
            } else {
                clearInterval(balanceInterval);
            }
        }, 20); // Speed of decrease

        balance = newBalance;
        totalSpent += totalCost;

        // Update total spent with smooth effect
        let currentSpent = totalSpent - totalCost;
        let spentInterval = setInterval(() => {
            if (currentSpent < totalSpent) {
                currentSpent += decreaseAmount;
                if (currentSpent > totalSpent) {
                    currentSpent = totalSpent;
                }
                totalSpentElement.textContent = currentSpent.toLocaleString();
            } else {
                clearInterval(spentInterval);
            }
        }, 20);

        updateProgressBar();

        if (cart[item.name]) {
            cart[item.name].quantity += quantity;
        } else {
            cart[item.name] = { price: item.price, quantity: quantity };
        }
        updateCartDisplay();
    } else {
        alert("Not enough money!");
    }
}


function updateCartDisplay() {
    cartElement.innerHTML = "";
    for (let itemName in cart) {
        let item = cart[itemName];
        const listItem = document.createElement("li");

        const itemDetails = document.createElement("div");
        let formattedTotal = formatAmount(item.price * item.quantity);
        itemDetails.textContent = `${itemName} AED ${item.price.toLocaleString()} x${item.quantity} = AED ${formattedTotal}`;
        listItem.appendChild(itemDetails);

        const removeDiv = document.createElement("div");
        const removeInput = document.createElement("input");
        removeInput.className = "quantity-input";
        removeInput.type = "number";
        removeInput.min = "1";
        removeInput.max = item.quantity;
        removeInput.value = "1";

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "-";
        removeBtn.onclick = () => removeItem(itemName, removeInput.value);

        removeDiv.appendChild(removeInput);
        removeDiv.appendChild(removeBtn);
        listItem.appendChild(removeDiv);

        cartElement.appendChild(listItem);
    }
}

function removeItem(itemName, quantityToRemove) {
    quantityToRemove = parseInt(quantityToRemove) || 1;
    const item = cart[itemName];

    if (item.quantity >= quantityToRemove) {
        item.quantity -= quantityToRemove;
        if (item.quantity === 0) {
            delete cart[itemName];
        }

        balance += item.price * quantityToRemove;
        totalSpent -= item.price * quantityToRemove;

        balanceElement.textContent = balance.toLocaleString();
        totalSpentElement.textContent = totalSpent.toLocaleString();
        updateProgressBar();
        updateCartDisplay();
    } else {
        alert("You don't have enough of this item to remove!");
    }
}

function updateProgressBar() {
    let percentage = (totalSpent / 100000000000) * 100;
    progressBar.style.width = percentage + "%";
}

// Function to update the receipt with formatted totals
function updateReceipt() {
    let receiptHTML = '';
    let totalAmount = 0;

    for (let itemName in cart) {
        const item = cart[itemName];
        let itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        // Format totals for receipt (using short term notation)
        let formattedItemTotal = formatAmount(itemTotal);

        receiptHTML += `
            <div class="receipt-item">
                <span class="item-name">${itemName}</span>
                <span class="item-price">AED ${item.price.toLocaleString()}</span>
                <span class="item-quantity">x${item.quantity}</span>
                <span class="item-total">= AED ${formattedItemTotal}</span>
            </div>
        `;
    }

    // Format the grand total for receipt
    let formattedTotalAmount = formatAmount(totalAmount);
    receiptHTML += `
        <div class="receipt-total">
            <span>Total: AED ${formattedTotalAmount}</span>
        </div>
    `;

    document.getElementById('receipt').innerHTML = receiptHTML;
}

function openCheckoutModal() {
    // Display the modal
    checkoutModal.style.display = "block";

    // Show the items in the cart
    let receiptHTML = '';
    let totalAmount = 0;

    for (let itemName in cart) {
        const item = cart[itemName];
        let itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        let formattedItemTotal = formatAmount(itemTotal);

        receiptHTML += `
            <div class="checkout-item">
                <span class="item-name">${itemName}</span>
                <span class="item-price">AED ${item.price.toLocaleString()}</span>
                <span class="item-quantity">x${item.quantity}</span>
                <span class="item-total">= AED ${formattedItemTotal}</span>
            </div>
        `;
    }

    // Format the total amount without shortening
    let formattedTotalAmount = totalAmount.toLocaleString();  // Full number format here
    checkoutTotalElement.textContent = `AED ${formattedTotalAmount}`;
    checkoutItemsElement.innerHTML = receiptHTML;
}


function closeCheckoutModal() {
    checkoutModal.style.display = "none";
}

function resetEverything() {

    balance = 100000000000;
    totalSpent = 0;
    cart = {};

    balanceElement.textContent = balance.toLocaleString();
    totalSpentElement.textContent = totalSpent.toLocaleString();
    updateProgressBar();
    updateCartDisplay();

    window.scrollTo(0, 0);

    closeCheckoutModal();
}

checkoutBtn.addEventListener("click", openCheckoutModal);

closeModalBtn.addEventListener("click", closeCheckoutModal);

resetBtn.addEventListener("click", resetEverything);

window.onclick = function(event) {
    if (event.target == checkoutModal) {
        closeCheckoutModal();
    }
};
