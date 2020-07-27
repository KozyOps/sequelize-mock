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
 * 
 * Transaction ID and Name:
 * If there is a parent transaction, the id will be set to the parent id 
 * and the name will be set with the same methodology that Sequelize would use.
 * For example, if we have a parent transaction with id of 5 and 3 savepoints,
 * the new transaction's name would be 5-sp-3.
 * 
 * If there is no parent transaction and the name parameter has not been passed in the options, 
 * the id and name are both set to an auto-incrementing counter based on the mock sequelize instance.
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
	this.savepoints = [];

	this.options = Object.assign({
      type: sequelize.options.transactionType,
      isolationLevel: sequelize.options.isolationLevel,
      readOnly: false
    }, options || {});
	
	this.parent = this.options.transaction;

	if (this.parent) {
		this.id = this.parent.id;
		this.parent.savepoints.push(this);
		this.name = `${this.id}-sp-${this.parent.savepoints.length}`;
	} else {
		this.id = this.name = this.sequelize.transactionCount;
		this.sequelize.transactionCount++;
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
 * 
 * @returns {Promise}
 */
Transaction.prototype.commit = function() {
	if (this.finished) {
		return Promise.reject(new Error(`Transaction cannot be committed because it has been finished with state: ${this.finished}`));
	}
	
	this.finished = 'commit';
	
	// run the aftercommithooks if they exist
	if (length(this._afterCommitHooks)){
		  return this._afterCommitHooks.reduce(function(prev, cur) { 
    			return prev.then(() => fn(cur))
  			}, Promise.resolve());
	}
	
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
Transaction.prototype.afterCommit = function(fn) {
  if (!fn || typeof fn !== 'function') {
    throw new Error('"fn" must be a function');
  }
  this._afterCommitHooks.push(fn);
}
