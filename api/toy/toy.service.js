import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

async function query(filterBy = {}) {
    try {
        let collection = await dbService.getCollection('toy')
        let toys = await collection.find().toArray()
        // if (filterBy.name || filterBy.inStock !== 'all') {
        //     const criteria = {}
        //     if (filterBy.name) criteria.name = { $regex: filterBy.name, $options: 'i' }
        //     if (filterBy.inStock !== 'all') {
        //         criteria.inStock = filterBy.inStock === 'available' ? { $eq: true } : { $eq: false }
        //     }
        //     toys = await collection.find(criteria).toArray()

        // }
        const criteria = _getCriteria(filterBy)
        toys = await collection.find(criteria).sort({ [criteria.sortBy]: 1 }).toArray()
        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne({ _id: ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const result = await collection.deleteOne({ _id: ObjectId(toyId) })
        if (result.deletedCount === 1) {
            console.log('Document deleted successfully.');
        } else {
            console.log('No document found with the specified id.');
        }
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {

        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = {
            name: toy.name,
            price: toy.price,
            labels: toy.labels,
            inStock: toy.inStock
        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: { ...toyToSave } })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

function _getCriteria(filterBy) {
    const criteria = {}
    if (filterBy.name) criteria.name = { $regex: filterBy.name, $options: 'i' }
    if (filterBy.inStock !== 'all') criteria.inStock = filterBy.inStock === 'available' ? { $eq: true } : { $eq: false }
    if (filterBy.labels) criteria.labels = { $in: filterBy.labels }
    if (filterBy.sortBy) criteria.sortBy = filterBy.sortBy
    return criteria
}

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg
}
