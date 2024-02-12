const fs=require("fs");
const http=require("http");
const data=fs.readFileSync(`${__dirname}/data.json`,'utf-8');
const main_file=fs.readFileSync(`${__dirname}/farm.html`,'utf-8');
const product_temp=fs.readFileSync(`${__dirname}/product_temp.html`,'utf-8')
const specfic_product=fs.readFileSync(`${__dirname}/specific_product.html`,'utf-8')
const j_data=JSON.parse(data);
const replaceTemp=(product_temp,j_data)=>{
    let array=j_data.map((element)=>{
        let another=product_temp;
        another= another.replaceAll('{*productName*}',element.productName);
        another= another.replaceAll('{*image*}',element.image);
        another= another.replaceAll('{*price*}',element.price);
        another= another.replaceAll('{*quantity*}',element.quantity);
        another=another.replaceAll('{*id*}',element.id);
        another=another.replaceAll('{*place*}',element.from);
        another=another.replaceAll('{*nutrients*}',element.nutrients);
        another=another.replaceAll('{*description*}',element.description)
         if(!element.organic){
           another=  another.replaceAll('{*organic*}','not-organic');
         }
         else{
            another= another.replaceAll('{*organic*}','');
         }
         return another;
     })
     return array;
}
const server=http.createServer((req,res)=>{
 const url =req.url;
 const product_array=replaceTemp(specfic_product,j_data);
 if(url==='/'){
    let array=replaceTemp(product_temp,j_data);
    let final_string=array.join('');
    let final_file=main_file.replaceAll("{*product-template*}",final_string);
    res.end(final_file);
 }
 else if(url==='/product?id=0'){
     res.end(product_array[0]);
 }
 else if(url==='/product?id=1'){
    res.end(product_array[1]);
 }
 else if(url==='/product?id=2'){
    res.end(product_array[2]);
 } else if(url==='/product?id=3'){
    res.end(product_array[3]);
 }
 else if(url==='/product?id=4'){
    res.end(product_array[4]);
 }
 else{
    res.writeHead(404,"Page NOT FOUND");
    res.end("<h1>SORRY PAGE NOT FOUND</h1>")
 }
})
server.listen(8000,'127.0.0.1',()=>{
    console.log("server is on");
})