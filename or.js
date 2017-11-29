var hex = require("jonah");
var dgram = require('dgram');
var client = dgram.createSocket('udp4');

//поиск общий (код 3)
var msgl = '686400186c73accf2365c006202020202020010000000000';
msgl = Buffer.from(msgl,'hex');

//поиск общий (код 2)
var msgs = '686400067161';
msgs = Buffer.from(msgs,'hex');

// Подписка (6864001e636caccf23654e36202020202020364e6523cfac202020202020 - розетка
var msgp = '6864001e636caccf2365c00620202020202006c06523cfac202020202020';
msgp = Buffer.from(msgp,'hex');

var msgOn  = '686400176463accf23654e362020202020200000000001';
msgOn = Buffer.from(msgOn,'hex');

var msgOff = '686400176463accf23654e362020202020200000000000';
msgOff = Buffer.from(msgOff,'hex');


client.on('message',function(msg,info){
  console.log('Data received: ' + msg.toString('hex'));
  console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
});
client.on('listening',function(){
  var address = client.address();
  var port = address.port;
  var family = address.family;
  var ipaddr = address.address;
  console.log('Server is listening at port' + port);
  console.log('Server ip :' + ipaddr);
  console.log('Server is IP4/IP6 : ' + family);
});
client.on('error',function(error){
  console.log('Error: ' + error);
  client.close();
});
client.bind(10000);

process.stdin.resume();
process.stdin.on('data', function(data){
	var x = data.toString('hex');
	
	if(x=='70700d0a'){ //ввод pp - подписка
		msg = msgp;
		sendMessage(msg);
	}else if(x=='6f6e0d0a'){ //ввод on
		msg = msgOn;
		sendMessage(msg);
	}else if(x=='6f660d0a'){  //ввод of
		msg = msgOff;
		sendMessage(msg);
	}else if(x=='310d0a' || x==1){  //ввод 1
		client.close();
	}else if(x=='320d0a' || x==2){  //ввод 2 поиск
		msg = msgs;
		sendMessage(msg);
	}else if(x=='330d0a' || x==3){  //ввод 3 вход в режим обучения
		msg = msgl;
		sendMessage(msg);
	}
	console.log('You enter: ' + x);
});

function sendMessage(msg){
		//console.log('You enter: ' + data.toString('utf8'));
		client.send(msg, 10000, '255.255.255.255', function(err){
			if(err){
				console.log('error: ' + err);
			}else console.log('msg OK: '+ msg.toString('hex'));
		});
}