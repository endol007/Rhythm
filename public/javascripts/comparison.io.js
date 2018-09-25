var socket = io('https://' + location.host);

socket.on('connect', function () {
    d1 = 0
    d2 = 0
    if(count < 256) d2 = count
    else {
      d1 = count - 255
      de = 255
    }
    data = new Uint8Array([d1,d2,0,0,0,6,1,3,0,0,0,27])
    console.log('request no - ' + count)
    client.write(Buffer.from(data.buffer))
    count++
});

socket.on('data', (data) => {
    no = buffer.from([data[0],data[1]])
    dcv = Buffer.from([data[11],data[12]])
    dca = Buffer.from([data[13],data[14]])
    console.log('요청번호: ' + no.readUInt16BE(0))
	console.log('dc전압: ' + dcv.readUInt16BE(0))
    console.log('dc전류: ' + dca.readUInt16BE(0))
})
