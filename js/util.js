// http://stackoverflow.com/a/14438954/3070886
function onlyUnique(value, index, self) { 
	return self.indexOf(value) === index;
}

function random(items){
	return items[Math.floor(Math.random()*items.length)];
}