'use strict';

/**
 * The mock class for the mock transaction interface.
 * 
 * @name Transaction
 * @fileOverview Mock class for the Transaction class
 */

var path = require('path'),
	Utils = require('./utils'),
	Errors = require('./errors'),
	QueryInterface = require('./queryinterface'),
	Sequelize = require('./sequelize');
	
/**
 * Sequelize Transaction Object for use with unmanaged transactions, 
 * and internally for Sequelize-Mock's managed transaction mocking.
 * Commit and Rollback will both throw errors in the same way that Sequelize would 
 * if an attempt to commit twice or rollback after commit is made.
 *  TODO: figure out how to handle mocking this.name 
 * If there is a parent transaction, the id will be set to the parent id 
 * and the name will be set to ???
 * If there is no parent transaction, the id and name are both set to ???
 *
 * 
 * @class Transaction
 * @constructor
 * @param {Function} [fn] Optional function to run as a transaction
 * @param {Object} [options] Optional options object 
 **/
function Transaction(fn, options) {
	this.sequelize = sequelize;
	this._afterCommitHooks = [];

	this.options = Object.assign({
      type: sequelize.options.transactionType,
      isolationLevel: sequelize.options.isolationLevel,
      readOnly: false
    }, options || {});
	
	this.parent = this.options.transaction;

	if (this.parent) {
		this.id = this.parent.id;
		//this.name = `${this.id}-sp-${this.parent.savepoints.length}`;
	} else {
		//this.id = this.name = 
	}
}

/**
 * Object containing all of the [Transaction Isolation Levels](https://sequelize.org/master/manual/transactions.html#isolation-levels).
 * 
 * @property
 **/
Transaction.ISOLATION_LEVELS = {
	READ_UNCOMMITTED: 'READ_UNCOMMITTED',
	READ_COMMITTED: 'READ_COMMITTED',
	REPEATABLE_READ: 'REPEATABLE_READ',
	SERIALIZABLE: 'SERIALIZABLE'
};

/**
 * Commit the transaction. Because this won't hit the database, it'll just set the finished flag
 * so that calling commit or rollback on the transaction again will throw an error.
 * 
 * TODO: If the .afterCommit hook has been set, .afterCommit logic will be called as well.
 * 
 * @returns {Promise}
 */
Transaction.prototype.commit = function() {
	if (this.finished) {
		return Promise.reject(new Error(`Transaction cannot be committed because it has been finished with state: ${this.finished}`));
	}
	
	this.finished = 'commit';
	
	return null;
}

/**
 * Rollback the transaction. Because this won't hit the database, it'll return the original transaction object
 * or throw if the transaction has already been committed.
 * 
 * If the .afterCommit hook has been set, .afterCommit logic will be called as well.
 * 
 * @returns {Transaction}
 */
Transaction.prototype.rollback = function() {
	if (this.finished) {
		return Promise.reject(new Error(`Transaction cannot be committed because it has been finished with state: ${this.finished}`));
	}
	
	return this;
}

 /**
 * A hook that is run after a transaction is committed. 
 *
 * @param {Function} fn   A callback function that is called with the committed transaction
 * @name afterCommit
 * @memberof Sequelize.Transaction
 */
Transaction.prototype.afterCommit= function(fn) {
  if (!fn || typeof fn !== 'function') {
    throw new Error('"fn" must be a function');
  }
  this._afterCommitHooks.push(fn);
}
