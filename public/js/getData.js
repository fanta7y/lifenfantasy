async function getData(offset=0) {
    let response = await fetch('http://192.168.0.118:3000/items', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            offset: offset,
        })
    });

    let items = await response.json();

    return items;
}
getData(0).then((items) => {
    console.log(items);
});