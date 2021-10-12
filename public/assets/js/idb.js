let db;
// IndexedDB database called 'pizza_hunt' and set it to version 1
const request = indexedDB.open('pizza_hunt', 1);

request.onupgradeneeded = function(event){
    //save ref to db
    const db = event.target.result;
    //create  object store called new_pizza with auto inc prim key
    //store obj prior to seeing if online jic
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

request.onsuccess = function(event) {
    //db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
      // we haven't created this yet, but we will soon, so let's comment it out for now
      uploadPizza();
    }
  };

request.onerror = function(event){
    console.log(event.target.errorCode);
};

//submit new pizza
function saveRecord(record){
    //opne new transaction with db with r/wr permission
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access obj store for 'new_pzza'
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    pizzaObjectStore.add(record);
};

function uploadPizza(){
    //open transaction on db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access obj store
    const pizzaObjectStore = transaction.objectStore('new_pizza');
    //get all records from store
    const getAll = pizzaObjectStore.getAll();

    getAll.onsuccess = function(){
        //if there was data in indexdb store send it to the api server
        if(getAll.result.length > 0){
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.results),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse);
                }
                //open another transaction
                const transaction = db.transaction(['new_pizza'], 'readwrite');
                //access new-pizza obj store
                const pizzaObjectStore = transaction.objectStore('new_pizza');
                pizzaObjectStore.clear();

                alert('All saved pizza has been submitted');
            })
            .catch(err =>{
                console.log(err);
            });
        }
    }
}

window.addEventListener('online', uploadPizza);
