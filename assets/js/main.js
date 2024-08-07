function main() {
  const cart = new Cart();
  const listOfProducts = [
    new Product("Leche", 1_000),
    new Product("Pan de Molde", 2_000),
    new Product("Queso", 1_200),
    new Product("Mermelada", 890),
    new Product("Azúcar", 1_300),
  ];
  // Render list of products in html
  renderListOfProducts(listOfProducts);

  setAddProductEvent(listOfProducts, cart);
  // In setAddProductEvent(), every event listener calls helper function
  // refreshBill() that renders the 'detail' section and add functionality to
  // buttons in that section.

  setCheckoutEvent(cart);
  // event added to button with value 'finalizar compra'
}

// Classes --------------------------------------------------------------------

class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
    this.quantity = 1;
  }
}
class Cart {
  constructor() {
    this.items = [];
  }
  static getItemIndex(cartObject, itemName) {
    // Assumes itemName is of type string.
    // return null if a product with name property 'itemName' is not in the
    // array this.items, else returns its index.
    if (!(cartObject instanceof Cart)) {
      throw new Error("First argument is not an object of type Cart.");
    }

    if (cartObject.items.length === 0) {
      return null;
    }

    for (let i = cartObject.items.length - 1; i >= 0; i--) {
      if (cartObject.items[i].name === itemName) {
        return i;
      } else if (i === 0) {
        // if we reach the first element of the array and no item in cart has
        // name 'itemName', return null
        return null;
      }
    }
  }

  addItem(item, quantity = 1) {
    // assumes 'item' of type Product. If item is not in this.items, add item.
    // If item already exist inside this.items, add quantity to its property
    // 'quantity'.
    if (!(item instanceof Product)) {
      throw new Error("First argument is not of type Product");
    }

    let index = Cart.getItemIndex(this, item.name);
    if (index === null) {
      this.items.push(item);
      // if quantity is more than 1, add quantity - 1 to 'quantity' property
      // of object just added.
      if (quantity > 1) {
        this.items[this.items.length - 1].quantity += quantity - 1;
      }
      return;
    } else {
      this.items[index].quantity += quantity;
    }
  }

  removeItem(itemName, quantity = 1) {
    // assumes 'itemName' is a string containing the name attribute of an
    // object of type Product. If item already exist, subtract quantity to its
    // property 'quantity'. If the property 'quantity' after subtraction has
    // value 0, remove item from this.items. Throw an error if there is no
    // object Product with attribute name 'itemName' or argument quantity is
    // greater than value of property 'quantity' of object Product.

    // check if 'quantity' is a number
    if (!(typeof quantity === "number")) {
      throw new Error("Second argument is not a number");
    }

    let index = Cart.getItemIndex(this, itemName);

    if (index == null) {
      throw new Error(
        `There is no item with name "${itemName}" inside the cart.`,
      );
    } else if (this.items[index].quantity - quantity < 0) {
      throw new Error(`There is no enough quantity of item ${itemName}.`);
    } else if (this.items[index].quantity - quantity === 0) {
      this.items.splice(index, 1);
    } else {
      this.items[index].quantity -= quantity;
    }
  }

  removeItemByIndex(index, quantity = 1) {
    // remove 'quantity' from the property 'quantity' of item of class Product
    // at index 'index' inside the cart. Throw errors if index is greater than
    // Cart.items length, or value of 'quantity' is greater than value of
    // item of class Product's property quantity. If, after the subtraction,
    // the property quantity is 0, remove item from Cart.items.
    if (index >= this.items.length) {
      throw new Error("Index value argument is too large.");
    } else if (quantity > this.items[index].quantity) {
      throw new Error(
        `The quantity of Item ${this.items[index].name} is less` +
          " than quantity argument.",
      );
    } else if (quantity == this.items[index].quantity) {
      this.items.splice(index, 1);
    } else {
      this.items[index].quantity -= quantity;
    }
  }

  removeAllItemByIndex(index) {
    // Remove item at index 'index', the value of its property quantity doesn't
    // matter.
    if (index >= this.items.length) {
      throw new Error("Index value argument is too large.");
    } else {
      this.items.splice(index, 1);
    }
  }

  getTotal() {
    // Return the total price of all the products inside the array this.items

    if (this.items.length === 0) {
      return 0;
    }
    //
    let total = 0;
    for (let i = this.items.length - 1; i >= 0; i--) {
      total += this.items[i].price * this.items[i].quantity;
    }
    return total;
  }

  getItemsList() {
    return this.items.slice();
  }

  clearItemsList() {
    this.items = [];
  }
}

// FUNCTIONS ------------------------------------------------------------------

function renderListOfProducts(listOfProducts) {
  let listOfProductsHtml = "";
  let index = 0;
  for (const product of listOfProducts) {
    listOfProductsHtml +=
      `<form action="" class="product" id="product${index}">` +
      `<span>${product.name} \$${product.price}</span>` +
      `<input type="number" name="product-quantity" value="1" min="1" />` +
      `<input type="submit" value="agregar"/></form>`;
    index++;
  }
  document.getElementById("products-list").innerHTML = listOfProductsHtml;
}

function setAddProductEvent(listOfProducts, cart) {
  // add event listener that add items to cart for every product in the list
  // listOfProduct. Each event listener calls function refreshBill at the end.

  index = 0;
  for (const product of listOfProducts) {
    document
      .getElementById(`product${index}`)
      .addEventListener("submit", function (form) {
        form.preventDefault();
        let quantity = this.elements["product-quantity"].value;

        cart.addItem(product, parseInt(quantity));

        this.elements["product-quantity"].value = "1";

        // refresh bill info
        refreshBill(cart);
      });
    index++;
  }
}

function refreshBill(cart) {
  let content =
    "<h2>Detalle:</h2>" +
    "<table><thead><tr><th></th><th>Producto</th><th>Unidades</th>" +
    "<th>Precio Unitario</th><th>Total</th><tbody>";

  let index = 0;
  for (const product of cart.getItemsList()) {
    content +=
      `<tr><td><input type="button" id="remove-${index}" name="remove" value="-"/>` +
      `<input type="button" id="add-${index}" name="add" value="+"/>` +
      `<input type="button" id="removeall-${index}" name="removeall" value="x"/></td>` +
      `<td>${product.name}</td><td>${product.quantity}</td>` +
      `<td>\$${product.price}</td><td>` +
      `\$${product.price * product.quantity}</td></tr>`;
    index++;
  }
  content +=
    `<tfoot><th scope="row" colspan="4">Total a pagar</th><td>` +
    `\$${cart.getTotal()}</td></tfoot></tbody></table>`;

  document.getElementById("detail-section").innerHTML = content;

  addButtonEventsToBill(cart);
}

function addButtonEventsToBill(cart) {
  // add functionality to buttons in bill section

  let inputs = document.querySelectorAll("#detail-section table td input");

  // loop through all input#button elements

  // #remove-* buttons
  for (let i = 0; i < inputs.length / 3; i++) {
    document
      .querySelector(`input#remove-${i}`)
      .addEventListener("click", function () {
        cart.removeItemByIndex(i);
        refreshBill(cart);
      });
  }

  // #add-* buttons
  for (let i = 0; i < inputs.length / 3; i++) {
    document
      .querySelector(`input#add-${i}`)
      .addEventListener("click", function () {
        cart.addItem(cart.getItemsList()[i], 1);
        refreshBill(cart);
      });
  }

  // removall-* buttons
  for (let i = 0; i < inputs.length / 3; i++) {
    document
      .querySelector(`input#removeall-${i}`)
      .addEventListener("click", function () {
        cart.removeAllItemByIndex(i);
        refreshBill(cart);
        // TODO implement method to remove all elements of item by index.
      });
  }
}

function setCheckoutEvent(cart) {
  document.querySelector("#submit").addEventListener("click", function () {
    if (cart.getItemsList().length === 0) {
      alert("No hay productos en el carro de compras.");
    } else {
      let content =
        '<main id="final-bill"><h2>Detalle:</h2>' +
        "<table><thead><tr><th>Producto</th><th>Unidades</th>" +
        "<th>Precio Unitario</th><th>Total</th><tbody>";
      for (const product of cart.getItemsList()) {
        content +=
          `<tr><td>${product.name}</td><td>${product.quantity}</td>` +
          `<td>\$${product.price}</td><td>` +
          `\$${product.price * product.quantity}</td></tr>`;
      }
      content +=
        `<tfoot><th scope="row" colspan="3">Total a pagar</th><td>` +
        `\$${cart.getTotal()}</td></tfoot></tbody></table>` +
        `<input type="button" value="volver a inicio" id="reload"></main>`;
      document.querySelector("body").innerHTML = content;

      document.querySelector("#reload").addEventListener("click", function () {
        location.reload();
      });
    }
  });
}

// MAIN CALL
main();
