let express = require("express") 
let mongodb = require("mongodb")
let sanitizeHTML = require("sanitize-html")


let app = express()
//give permission to server to access public.js
app.use(express.static("public"))
//connect to your mongodb acc
let connectionString = 'mongodb+srv://manpreet_nodejs:manpreet_nodejs@cluster0.cysgj.mongodb.net/to_do_app?retryWrites=true&w=majority'
let db

let port = process.env.PORT
if(port==null || port=="")port=3000
mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client)=>{
    db = client.db()
    app.listen(port)
})
app.use(express.json()) //for async req
app.use(express.urlencoded({extended: false})) //for html form data
app.use(passwordProtected)//for all our url/routes this function will be used

function passwordProtected(req, res, next){
    res.set('WWW-Authenticate', 'Basic realm="Simple Todo App')
    console.log(req.headers.authorization)
    if(req.headers.authorization == "Basic bWFucHJlZXQ6bWFucHJlZXQ="){ //manpreet manpreet
        next() //this function is done now go ahead and run the next callback function
    }else{
        res.status(401).send("Authentication required")
    }
   
}

app.get('/', (req, res)=>{
    db.collection('items').find().toArray((err, items)=>{
        //console.log(items[0].text)
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple To-Do App</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
        </head>
        <body>
        <div class="container">
            <h1 class="display-4 text-center py-1">To Do App</h1>
            
            <div class="jumbotron p-3 shadow-sm">
            <form  id="create-form" action="/create-item" method="POST">
                <div class="d-flex align-items-center">
                <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                <button class="btn btn-primary">Add New Item</button>
                </div>
            </form>
            </div>
            
            <ul id="item-list" class="list-group pb-5">
            </ul>
            </div>
            <script>
            let items = ${JSON.stringify(items)}
            </script>
            <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
            <script src="/browser.js"></script>
        </body>
        </html>
        `)
    }) //READ OPERATION
})

app.post("/create-item", (req, res)=>{
    let safeText = sanitizeHTML(req.body.text, {allowedTags:[], allowedAttributes:{}})
    db.collection('items').insertOne({text:safeText}, (err, info)=>{
        res.json(info.ops[0])
    })
    
})

app.post('/update-item', (req, res)=>{
    let safeText = sanitizeHTML(req.body.text, {allowedTags:[], allowedAttributes:{}})
    db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {text: safeText}}, ()=>{
        res.send("Success")
    })

})

app.post('/delete-item', (req, res)=>{
    db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, ()=>{
        res.send("Success")
    })

})

//{useNewUrlParser: true, useUnifiedTopology: true}