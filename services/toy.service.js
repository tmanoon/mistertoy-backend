
import fs from 'fs'
import { utilService } from './util.service.js'
// import { loggerService } from './logger.service.js'

export const toyService = {
    query,
    getById,
    remove,
    save
}

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy = {}) {
    let filteredToys = toys
    if (filterBy.name) {
        const regex = new RegExp(filterBy.name, 'i')
        filteredToys = filteredToys.filter(toy => regex.test(toy.name))
    }
    if (filterBy.inStock) {
        if (filterBy.inStock === 'low') {
            let lowStockToys = []
            let stockOfToys = filteredToys.reduce((acc, currToy) => {
                if (currToy.inStock) {
                    if (acc[currToy.name]) acc[currToy.name]++
                    else acc[currToy.name] = 1
                }
                return acc
            }, {})

            for (const toy in stockOfToys) {
                if (stockOfToys[toy] <= 2 && stockOfToys[toy] > 0) {
                    lowStockToys.push(filteredToys.find(_toy => _toy.name === toy))
                }
            }
            filteredToys = lowStockToys
        } else {
            const stockStatus = filterBy.inStock === 'available' ? true : false
            filteredToys = filteredToys.filter(toy => toy.inStock === stockStatus)
        }
    }
    if (filterBy.sortBy) {
        if (filterBy.sortBy === 'name') {
            filteredToys = filteredToys.sort((firstToy, secondToy) => firstToy.name.localeCompare(secondToy.name))
        }
        else {
            filteredToys = filteredToys.sort((firstToy, secondToy) => firstToy[filterBy.sortBy] - secondToy[filterBy.sortBy])
        }
    }
    return Promise.resolve(filteredToys)
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No such toy')
    // const toy = toys[idx]
    // if (!loggedinUser.isAdmin &&
    //     toy.owner._id !== loggedinUser._id) {
    //     return Promise.reject('Not your toy')
    // }
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy, loggedinUser) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        // if (!loggedinUser.isAdmin &&
        //     carToUpdate.owner._id !== loggedinUser._id) {
        //     return Promise.reject('Not your car')
        // }
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toyToUpdate.labels = toy.labels
        toyToUpdate.inStock = toy.inStock
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toy.createdAt = Date.now()
        // car.owner = {
        //     fullname: loggedinUser.fullname,
        //     score: loggedinUser.score,
        //     _id: loggedinUser._id,
        //     isAdmin: loggedinUser.isAdmin
        // }
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
}


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                // loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
