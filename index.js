const qaItems = [
	{
		question: "How do I track my package?",
		answer:
			"You can easily track your package using our online tracking system. Simply enter your tracking number on our website to get real-time updates on your delivery's status.",
	},
	{
		question: "What should I do if my package is damage or lost?",
		answer:
			"If your package arrives damaged or is lost in transit, please contact us immediately. We will investigate the matter and arrange for a replacement or refund as per our policy.",
	},
	{
		question: "Can I change my delivery address after placing an order?",
		answer:
			"Yes, you can change your delivery address as long as the package has not been dispatched. Please Contact our customer service team as soon as possible to make any changes.",
	},
	{
		question: "Are there any items that cannot be shipped?",
		answer:
			"Yes, there are certain restrictions on items that can be shipped due to safety and legal reasons. Please refer to our shipping policy or contact us for more information on prohibited items.",
	},
];

const accordionDiv = document.getElementById("accordion");

qaItems.forEach((qaItem) => {
	const questionText = qaItem.question;
	const answerText = qaItem.answer;

	// const { questionText: question, answerText: answer } = qaItem

	const questionDiv = document.createElement("div");
	questionDiv.classList.add("accordion-question");
	questionDiv.textContent = questionText;

	const answerDiv = document.createElement("div");
	answerDiv.classList.add("accordion-answer");
	answerDiv.textContent = answerText;

	questionDiv.appendChild(answerDiv);

	questionDiv.addEventListener("click", () => {
		questionDiv.classList.toggle("active");
		answerDiv.classList.toggle("active");
	});

	accordionDiv.appendChild(questionDiv);
});

class DatabaseObject{
	toString() {
		throw new Error("Not Implemented");
	}
}

class Product extends DatabaseObject {
	constructor(name, inventory) {
		super();
		this.name = name;
		this.inventory = inventory;
	}

	toString() {
		return `${this.name}: ${this.inventory} left in stock`;
	}
}

class Delivery extends DatabaseObject {
	constructor(params){
		super();
		const {address, scheduledTime, product, quantity} = params
		this.address = address;
		this.scheduledTime = scheduledTime;
		this.product = product;
		this.quantity = quantity;
	}

	toString() {
		return `Delivering ${this.quantity} ${this.product.name} to ${this.address} at ${this.scheduledTime}`;
	}

	static create(params){
		// const {address, scheduledTime, product, quantity} = params
		return new Delivery(params);
	}
}

class ProductDao {
	static seeds = [
		{
			name: "Apples",
			inventory: 100,
		},
		{
			name: "Bananas",
			inventory: 90,
		},
		{
			name: "Peaches",
			inventory: 70,
		},
	];
	getAll() {
		throw new Error("Not implemented");
	}

	// getProductByName(name) {
	// 	throw new Error("Not implemnented");
	// }

	getProductByName(name) {
		const products = this.getAll();
		return products.find((product) => product.name == name);
	}

	update(product) {
		throw new Error("Not implemnented");
	}
}

class SessionStorageProductDao extends ProductDao {
	constructor() {
		super();
		this.database = sessionStorage;
	}
	getAll() {
		const productsAsJSON = this.database.getItem("products");
		const productsData = productsAsJSON ? JSON.parse(productsAsJSON) : ProductDao.seeds;
		// console.log("productsData");
		// console.log(productsData);
		return productsData.map((productData) => {
			const {name, inventory} = productData;
			// console.log("productData");
			// console.log(productData);
			return new Product(name, inventory);
		});
	}

	// getProductByName(name) {
	// 	const products = this.getAll();
	// 	return products.find((product) => product.name == name);
	// }


	update(product) {
		const existingProducts = this.getAll();
		const indexToDelete = existingProducts.findIndex(
			(productInList) => productInList.name == product.name);
			existingProducts.splice(indexToDelete, 1, product);
			// console.log("IndexToDelete");
			// console.log(indexToDelete);
		this.database.setItem("products", JSON.stringify(existingProducts));
			// console.log("existingProducts");
			// console.log(existingProducts);
	}
} 

class CookieStorageProductDao extends ProductDao {
	constructor(){
		super();
		this.database = document.cookie;
	}

	getAll() {
		const cookieValue = document.cookie
			.split("; ")
			.find((row) => row.startsWith("products"))
			?.split("=")[1];
		
		const productsData = cookieValue ? JSON.parse(cookieValue) : ProductDao.seeds;
		return productsData.map(
			(productData) => new Product(productData.name, productData.inventory),
		);
	}

	update(product) {
		const existingProducts = this.getAll();
		const indexToDelete = existingProducts.findIndex(
			(productInList) => productInList.name == product.name);
			existingProducts.splice(indexToDelete, 1, product);
			// console.log("IndexToDelete");
			// console.log(indexToDelete);
			document.cookie = `products=${JSON.stringify(existingProducts)}`;
			// console.log("existingProducts");
			// console.log(existingProducts);
	}
}

class DeliveryDao{
	getAll() {
		throw new Error("Not yet Implemented");
	}

	create(delivery) {
		throw new Error("Not yet Implemented");
	}
}

class SessionStorageDeliveryDao extends DeliveryDao {
	constructor() {
		super();
		this.database = sessionStorage;
	}
	
	getAll() {
		const deliveriesinSessionStorage = this.database.getItem("deliveries");
		// console.log("deliveriesData");
		// console.log(deliveriesData);
		const deliveriesData = deliveriesinSessionStorage ? JSON.parse(deliveriesinSessionStorage) : [];
		return deliveriesData.map((deliveryData) => {
			// const {address, scheduleTime, product, quantity} = deliveryData;
			return Delivery.create(deliveryData)
		});
	}

	create(delivery) {
		const deliveries = this.getAll();
		deliveries.push(delivery);
		this.database.setItem("deliveries", JSON.stringify(deliveries));
	}
}

class CookieStorageDeliveryDao extends DeliveryDao {
	getAll() {
		const cookieValue = document.cookie
			.split("; ")
			.find((row) => row.startsWith("deliveries"))
			?.split("=")[1];
		
		const deliveriesData = cookieValue ? JSON.parse(cookieValue) : [];
		return deliveriesData.map(
			(deliveryData) => new Product(deliveryData.name, deliveryData.inventory),
		);
	}

	create(delivery) {
		const existingDeliveries = this.getAll();
		existingDeliveries.push(delivery);
		document.cookie = `products=${JSON.stringify(existingDeliveries)}`;
	}
}

class CreateDeliveryService{
	constructor(productDao, deliveryDao) {
		this.productDao = productDao;
		this.deliveryDao = deliveryDao;
	}

	CreateDelivery(productName, quantity, address, scheduledTime) {
		const product = this.productDao.getProductByName(productName);
		const newInventory = product.inventory - quantity;
		product.inventory = newInventory;
		// console.log("newInventory");
		// console.log(newInventory);
		const deliveryData = {
			product,
			quantity,
			address,
			scheduledTime
		};
		this.deliveryDao.create(deliveryData);
		// console.log("product");
		// console.log(product);
		this.productDao.update(product);
	}
}

// const productDao = new SessionStorageProductDao();
const productDao = new CookieStorageProductDao();
// const deliveryDao = new SessionStorageDeliveryDao();
const deliveryDao = new CookieStorageDeliveryDao();
const createDeliveryService = new CreateDeliveryService(productDao, deliveryDao);

const deliveryList = document.getElementById("deliveries-list");
const deliveries = deliveryDao.getAll();
	for(let i=0; i < deliveries.length; i++){
		const delivery = deliveries[i];
		// const {address, scheduledTime, product, quantity} = delivery;
		const deliveryLi = document.createElement("li");
		deliveryLi.textContent = delivery.toString();
		deliveryList.appendChild(deliveryLi);
}	

const productNameSelect = document.querySelector("#deliveries form select");
// console.log("productNameSelect");
// console.log(productNameSelect);
const quantityInput = document.querySelector("#deliveries form input[name='quantity']");
const products = productDao.getAll();
// console.log("products");
// console.log(products[0].toString());
	for (let i = 0; i < products.length; i++){
		const product = products[i];
		const option = document.createElement("option");
		option.innerText = product.toString();
		option.setAttribute("value", product.name);
		const existingInventory = product.inventory;
		if(i ==0){
			// console.log("product");
			// console.log(product);
			quantityInput.setAttribute("max", existingInventory);
			// console.log('quantityInput.getAttribute("max")');
			// console.log(quantityInput.getAttribute("max"));
		}
		if(existingInventory > 0) {
		productNameSelect.appendChild(option);
		}
	}

function handleChangetoProductName(event){
	const productName = event.target.value;
	const selectedProduct = productDao.getProductByName(productName);
	const existingInventory = selectedProduct.inventory;	
	quantityInput.setAttribute("max", existingInventory);
}

productNameSelect.addEventListener("change", handleChangetoProductName);

const createDeliveryForm = document.querySelector("#deliveries form");
// console.log("createDeliveryForm");
// console.log(createDeliveryForm);
// console.log("About to submit Form...");
createDeliveryForm.addEventListener("submit" , (event) => {
	// event.preventDefault();
	// console.log("Submitting form...")
	const formData = new FormData(event.target);
	const productName = formData.get("productName");
	const scheduledTime = formData.get("scheduledTime");
	const address = formData.get("address");
	const quantity = formData.get("quantity");
	createDeliveryService.CreateDelivery(productName, quantity, address, scheduledTime);
}); 