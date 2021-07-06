const devicesTable = process.env.DEVICES_TABLE;
class Devices {
  constructor(db) {
    this.db = db;
  }

  //we use put method to add an item. We specify a condition that serial number (sn) should not exists in the device table.
  async save(device) {
     await this.db.put({
      TableName: devicesTable,
      Item: device,
      ConditionExpression: "attribute_not_exists(sn)"
    }).promise()
  }

  //we make a query to get a device by user_id. Since the primary key is user_id and sn, we can not use method get to read devices by user_id. For more info please refer to https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
  async getAll(userID) {
    const params = {
      KeyConditionExpression: "user_id = :user_id",
      TableName: devicesTable,
      ExpressionAttributeValues: {
        ":user_id": userID
      }
    };
    const res = await this.db.query(params).promise()
    return res;
  }


  //we use get method to get an item by primary key
  async get(userID, sn) {
    const params = {
      Key: {
        user_id: userID,
        sn: sn
      },
      TableName: devicesTable
    };
    const res = await this.db.get(params).promise();
    return res;
  }

//we can use update expression to update an item, for more information please refer to https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
 //We return the news  values from DymanoDB, that means the items that were updated
async update(sn, userID, device) {
    const updatedDate = new Date().toISOString();
    let updateExpression = "set updatedAt = :l ";
    let expressionAttributeValues = {};
    expressionAttributeValues[':l'] = updatedDate;
    if (device.model_name !== undefined) {
      updateExpression += ",model_name = :model_name ";
      expressionAttributeValues[':model_name'] = device.model_name;
    }
    if (device.device_name !== undefined) {
      updateExpression += ",device_name = :device_name ";
      expressionAttributeValues[':device_name'] = device.device_name;
    }
    if (device.mac_address !== undefined) {
      updateExpression += ",mac_address = :mac_address ";
      expressionAttributeValues[':mac_address'] = device.mac_address;
    }
  
    const params = {
      Key: {
        user_id: userID,
        sn: sn
      },
      TableName: devicesTable,
      ConditionExpression: 'attribute_exists(sn)',
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    const res = await this.db.update(params).promise();
    return res;
  }

  //deleting an item is straightforward, by specifying its primary key. We return the old values from DymanoDB, that means the item that were deleted.
  async delete(userID, sn) {
    const params = {
      Key: {
        user_id: userID,
        sn: sn
      },
      TableName: devicesTable,
      ReturnValues: 'ALL_OLD'
    };
    const res = await this.db.delete(params).promise()
    return res;
  }

}

module.exports = Devices;