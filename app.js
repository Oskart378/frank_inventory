document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const productTable = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    const totalValueElem = document.getElementById('totalValue');
    const nameInput = document.getElementById('name');
    const priceInput = document.getElementById('price');
    const quantityInput = document.getElementById('quantity');

    let editingRow = null; // Track the row being edited

    const backendUrl = 'https://frank-inventory.onrender.com'; // Update this with your deployed backend URL

async function fetchProducts() {
        const response = await fetch(`${backendUrl}/products`);
        const products = await response.json();
        productTable.innerHTML = ''; // Clear the table
        products.forEach(product => {
            addRow(product);
        });
        updateTotalValue();
    }

    async function addProductToDatabase(product) {
        await fetch('http://localhost:3000/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });
    }

    async function deleteProductFromDatabase(id) {
        await fetch(`http://localhost:3000/products/${id}`, {
            method: 'DELETE',
        });
    }

    // Add Product or Update Product
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const name = nameInput.value.trim();
        const price = parseFloat(priceInput.value);
        const quantity = parseInt(quantityInput.value);

        if (name && !isNaN(price) && price >= 0 && !isNaN(quantity) && quantity >= 0) {
            const total = price * quantity; // Calculate total value

            if (editingRow) {
                // Update existing row
                const id = editingRow.dataset.id;
                const updatedProduct = { name, price, quantity, total };
                await fetch(`http://localhost:3000/products/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedProduct),
                });
                
                editingRow.cells[0].textContent = name;
                editingRow.cells[1].textContent = `$${price.toFixed(2)}`;
                editingRow.cells[2].textContent = quantity;
                editingRow.cells[3].textContent = `$${total.toFixed(2)}`;
                
                editingRow = null; // Reset editingRow
            } else {
                // Add new row
                const newProduct = { name, price, quantity, total };
                await addProductToDatabase(newProduct);
                fetchProducts(); // Refresh the product list
            }

            updateTotalValue();
            productForm.reset(); // Clear form fields
            document.getElementById('formError').style.display = 'none'; // Hide error message
            nameInput.focus(); // Set focus to the name input
        } else {
            document.getElementById('formError').style.display = 'block';
        }
    });

    function addRow(product) {
        const row = productTable.insertRow();
        row.dataset.id = product._id;
        row.insertCell(0).textContent = product.name;
        row.insertCell(1).textContent = `$${product.price.toFixed(2)}`;
        row.insertCell(2).textContent = product.quantity;
        row.insertCell(3).textContent = `$${product.total.toFixed(2)}`; // Display total value

        const actionsCell = row.insertCell(4); // Adjust column index for actions
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            nameInput.value = product.name;
            priceInput.value = product.price;
            quantityInput.value = product.quantity;
            
            editingRow = row; // Set the row to be edited
            nameInput.focus(); // Set focus to the name input
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', async () => {
            await deleteProductFromDatabase(product._id);
            row.remove();
            updateTotalValue();
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
    }

    function updateTotalValue() {
        let totalValue = 0;

        for (const row of productTable.rows) {
            const total = parseFloat(row.cells[3].textContent.replace('$', ''));
            totalValue += total; // Sum the total values of each product
        }

        totalValueElem.textContent = `Total Value: $${totalValue.toFixed(2)}`;
    }

    fetchProducts(); // Load initial products
});
