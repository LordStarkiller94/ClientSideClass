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
		return '${this.name}: ${this.Inventory} left in stock';
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
		return "Delivering ${quantity} of ${product} to ${address} at ${scheduledTime}";
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

	getProductByName(name) {
		throw new Error("Not implemnented");
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

	getProductByName(name) {
		const products = getAll();
		return products.find((product) => product.name == name);
	}


	update(product) {
		const existingProducts =this.getAll();
		const indexToDelete = existingProducts.findIndex((productInList) => productInList.name == product.name);
		existingProducts.splice(indexToDelete, 1, product);
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
		const deliveriesData = deliveriesinSessionStorage ? JSON.parse(deliveriesAsJSON) : [];
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

class CreateDeliveryService{
	constructor(productDao, deliveryDao) {
		this.productDao = productDao;
		this.deliveryDao = deliveryDao;
	}

	CreateDelivery(productName, quantity, address, scheduledTime) {
		const product = this.productDao.getProductByName(productName);
		const newInventory = product.inventory - quantity;
		product.inventory = newInventory;
		const deliveryData = {
			product,
			quantity,
			address,
			scheduledTime
		};
		this.deliveryDao.create(deliveryData);
		productDao.update(product);
	}
}

const productDao = new SessionStorageProductDao();
const deliveryDao = new SessionStorageDeliveryDao();
const createDeliveryService = new CreateDeliveryService(productDao, deliveryDao);

const deliveryList = document.getElementById("deliveries-list");
const deliveries = deliveryDao.getAll();
	for(let i=0; i < deliveries.length; i++){
		const delivery = deliveries[i];
		// const {address, scheduledTime, product, quantity} = delivery;
		const deliveryLi = document.createElement("li");
		deliveryList.textContent = delivery.toString();
		deliveryList.appendChild(deliveryLi);
}	


const productNameSelect = document.querySelector("#deliveries form select");
// console.log("productNameSelect");
// console.log(productNameSelect);
const products = productDao.getAll();
// console.log("products");
// console.log(products[0].toString());
	for (let i = 0; i < products.length; i++){
		const product = products[i];
		const option = document.createElement("option");
		option.innerText = product.toString();
		option.setAttribute("value", product.name);
		productNameSelect.appendChild(option);
	}

// class CookieStorageProductDao extends ProductDao {
// 	constructor() {
// 		this.database = document.cookie;
// 	}



// }