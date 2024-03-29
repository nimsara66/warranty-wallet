import { StatusCodes } from 'http-status-codes'
import Manufacturer from '../models/Manufacturer.js'
import Retailer from '../models/Retailer.js'
import User from '../models/User.js'
import { BadRequestError } from '../errors/index.js'

const getRetailerFriends = async (req, res) => {
  const retailerFriends = (await Manufacturer.findOne({
    userId: req.user.userId,
  })
    .populate('retailerFriends')
    .select('retailerFriends')).retailerFriends
  const retailers = await User.aggregate([
    {
      $match: {
        _id: { $in: retailerFriends.map(user => user._id) }
      }
    },
    {
      $lookup: {
        from: 'retailers',
        localField: '_id',
        foreignField: 'userId',
        as: 'retailer'
      }
    },
    {
      $addFields: {
        retailer: { $arrayElemAt: ["$retailer", 0] },
      }
    }, 
    {
      $unwind: '$retailer'
    },
    {
      $project: {
        email: 1,
        _id: '$retailer._id',
        userId: '$retailer.userId',
        company: '$retailer.company',
        website: '$retailer.website',
        __v: '$retailer.__v'
      }
    },
  ])
  res.status(StatusCodes.OK).json(retailers)
}

const getRetailerRequests = async (req, res) => {
  const retailerRequests = (await Manufacturer.findOne({
    userId: req.user.userId,
  })
    .populate('retailerRequests')
    .select('retailerRequests')).retailerRequests
  const retailers = await User.aggregate([
    {
      $match: {
        _id: { $in: retailerRequests.map(user => user._id) }
      }
    },
    {
      $lookup: {
        from: 'retailers',
        localField: '_id',
        foreignField: 'userId',
        as: 'retailer'
      }
    },
    {
      $addFields: {
        retailer: { $arrayElemAt: ["$retailer", 0] },
      }
    }, 
    {
      $unwind: '$retailer'
    },
    {
      $project: {
        email: 1,
        _id: '$retailer._id',
        userId: '$retailer.userId',
        company: '$retailer.company',
        website: '$retailer.website',
        __v: '$retailer.__v'
      }
    },
  ])
  res.status(StatusCodes.OK).json(retailers)
}

const getNonRetailerFriends = async (req, res) => {
  const queryManufacturer = await Manufacturer.findOne({
    userId: req.user.userId,
  }).select('retailerFriends')
  const retailerFriendIds = queryManufacturer.retailerFriends
  const retailerFriends = await Retailer.aggregate([
    {
      $match: {
        userId: { $nin: retailerFriendIds },
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $addFields: {
        user: { $arrayElemAt: ["$user", 0] },
      }
    }, 
    {
      $unwind: '$user'
    },
    {
      $project: {
        email: '$user.email',
        _id: 1,
        userId: '$user._id',
        company: 1,
        website: 1,
        __v: 1
      }
    },
  ])
  res.status(StatusCodes.OK).json(retailerFriends)
}

const sendRetailerRequest = async (req, res) => {
  const { userId } = req.query
  if (!userId) {
    throw new BadRequestError('please provide userId')
  }

  const retailerExists = await Retailer.count({ userId })
  if (!retailerExists) {
    throw new BadRequestError('user not found')
  }

  const retailerHasSentRequest = await Manufacturer.count({
    userId: req.user.userId,
    retailerRequests: userId,
  })

  if (retailerHasSentRequest > 0) {
    throw new BadRequestError('retailer has already sent a request')
  }

  const retailerIsAlreadyFriend = await Manufacturer.count({
    userId: req.user.userId,
    retailerFriends: userId,
  })
  
  if (retailerIsAlreadyFriend > 0) {
    throw new BadRequestError('retailer is already a friend')
  }
  // console.log('retailerExists', retailerExists)
  // console.log('retailerHasSentRequest', retailerHasSentRequest)

  const addRetailerRequest = await Retailer.findOneAndUpdate(
    {
      userId: userId,
      manufacturerRequests: { $ne: req.user.userId },
    },
    { $addToSet: { manufacturerRequests: req.user.userId } },
    { new: true }
  )
  res.status(StatusCodes.OK).json(addRetailerRequest)
}

const removeRetailerRequest = async (req, res) => {
  const { userId } = req.query
  if (!userId) {
    throw new BadRequestError('please provide userId')
  }

  const retailerExists = await Retailer.count({ userId })
  if (!retailerExists) {
    throw new BadRequestError('user not found')
  }

  const removeRetailerRequest = await Manufacturer.findOneAndUpdate(
    {
      userId: req.user.userId,
    },
    { $pull: { retailerRequests: userId } },
    { new: true }
  )
  res.status(StatusCodes.OK).json(removeRetailerRequest)
}

const approveRetailerRequest = async (req, res) => {
  const { userId } = req.query
  if (!userId) {
    throw new BadRequestError('please provide userId')
  }

  const retailerExists = await Retailer.count({ userId })
  if (!retailerExists) {
    throw new BadRequestError('user not found')
  }

  const retailerRequest = await Manufacturer.count({
    userId: req.user.userId,
    retailerRequests: userId,
  })

  if (retailerRequest === 0) {
    throw new BadRequestError('no request found')
  }

  const approveRetailerRequest = await Manufacturer.findOneAndUpdate(
    {
      userId: req.user.userId,
    },
    {
      $pull: { retailerRequests: userId },
      $addToSet: { retailerFriends: userId },
    },
    { new: true }
  )

  const addManufacturerToRetailerFriends = await Retailer.findOneAndUpdate(
    {
      userId: userId,
    },
    {
      $addToSet: { manufacturerFriends: req.user.userId },
    },
    { new: true }
  )
  res.status(StatusCodes.OK).json(approveRetailerRequest)
}

const getManufacturerSentRequests = async (req, res) => {
  const getManufacturerSentRequests = await Retailer.find(
    {
      manufacturerRequests: { $in: [req.user.userId] },
    },
  )
  res.status(StatusCodes.OK).json(getManufacturerSentRequests)
}

export {
  getRetailerFriends,
  getNonRetailerFriends,
  getRetailerRequests,
  sendRetailerRequest,
  removeRetailerRequest,
  approveRetailerRequest,
  getManufacturerSentRequests
}
