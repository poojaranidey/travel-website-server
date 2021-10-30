const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();



const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.de956.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('tourWorld');
        const servicesCollection = database.collection('services');
        const orderCollection = database.collection('myorder');

        // GET API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });
        // get single item
        app.get("/services/:id", async (req, res) => {
            const serviceId = req.params.id;
            console.log(serviceId);
            const result = await servicesCollection.findOne({
                _id: ObjectId(serviceId),
            });
            res.json(result);
        });

        // POST API
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service)
            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result);
        });

        // DELETE API
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        });

        app.put('/myorder/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        app.post('/myorder', async (req, res) => {
            const newPlan = req.body
            const result = await orderCollection.insertOne(newPlan)
            res.json(result)
        })

        app.get('/myorder', async (req, res) => {
            const cursor = orderCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        app.delete('/myorder/:id', async (req, res) => {
            const id = req.params.id
            const cursor = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(cursor)
            res.json(result)
        });




    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('running tour server');
});

app.listen(port, () => {
    console.log('running server on port', port);
})