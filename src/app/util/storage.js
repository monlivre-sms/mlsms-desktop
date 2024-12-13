let storage = null;

if(typeof(sessionStorage) !== "undefined"){
   //use the local storage
   storage = sessionStorage;
}

export default storage;
