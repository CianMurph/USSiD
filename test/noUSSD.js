var admin = require("firebase-admin");

var serviceAccount = require("../ussd-test-1bea5-firebase-adminsdk-55hk2-1b86b2778e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore()
await db.collection(key).doc(prod).set(save_to_database[key][prod])

//Get all docs under the given category
helper_func_get_data = async (category, db) => {
	const data = await db.collection(category).get()
	if(data.empty)
		{
			return -1
		}
	else return data

}

let data = helper_func_get_data('ussd',db);

console.log(data);