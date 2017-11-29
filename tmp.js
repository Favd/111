var data = Buffer.from([0x68, 0x64, 0x00, 0x06, 0x71, 0x61]);
console.log('Bufer prosto is HEX: ' + data);
//var data = Buffer.from('hd06qa');
data = data.toString('hex');
console.log('Bufer data.toString("hex"): ' + data);

var data = Buffer.from([0x68, 0x64, 0x00, 0x06, 0x71, 0x61]);
Buffer.from(data.toString('hex'));
console.log('Bufer Buffer.from(data.toString("hex"));: ' + data);