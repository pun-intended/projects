const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {

    /**
     * Create a job, update db, return new job
     * 
     * Data should be {title, salary, equity, company_handle}
     */
   
    static async create({title, salary, equity, company_handle}){
        const result = await db.query(`
            INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle`,
            [title, salary, equity, company_handle]);
        
        const job = result.rows[0];
        return(job);
    }
   
    /**
     * Return array of all jobs
     * 
     * @returns [{id, title, salary, equity, company_handle}, ...]
     */
    static async findAll(){
        const jobsRes = await db.query(`
        SELECT id, title, salary, equity, company_handle
        FROM jobs
        ORDER BY title
        `);
        return jobsRes.rows;
    }

    /**
     * Return list of jobs that meet the filter criteria of 'title', 'minSalary', 
     * 'hasEquity'
     * 
     * @param {*} filter 
     * @returns [{id, title, salary, equity, company_handle}, ...]
     */
    static async findFiltered(filter = {}){
        console.log(filter)
    
        const queryStart = 
          `SELECT   id,
                    title,
                    salary,
                    equity,
                    company_handle
          FROM jobs`
        const orderBy = `ORDER BY title`
        
        const { title, minSalary, hasEquity } = filter
        if (!title && !minSalary && !hasEquity) return Job.findAll()
    
        let filterStr = " WHERE "
        if(title){
            filterStr += `LOWER(title) LIKE '%${title.toLowerCase()}%' `
          if (minSalary || hasEquity){
            filterStr += `AND `
          }
        }
        if(minSalary){
          filterStr += `salary >= ${minSalary} `
          if ( hasEquity ){
            filterStr += `AND `
          }
        }
        if(hasEquity){
          filterStr += `equity > 0 `
          }
        
        const queryStr = `${queryStart}${filterStr}${orderBy}`

        console.log(queryStr)
        const filteredComps = await db.query(queryStr)
        return filteredComps.rows
    
    }

    /**
     * Return job with given id.  Throws NotFoundError if job id does not exist
     * 
     * @param {*} id 
     * @returns {id, title, salary, equity, company_handle}
     */
      static async get(id) {
        const jobResult = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs
            WHERE id = $1`,
            [id]
        )

        const job = jobResult.rows[0]
        if(!job) throw new NotFoundError(`No job id:${id}`)
        return(job)
    }

    /**
     * Update job with new criteria passed as argument.
     * Throws NotFoundError if job id does not exist
     * 
     * @param {*} id 
     * @param {*} data 
     * @returns {id, title, salary, equity, company_handle}
     */
    static async update(id, data){
        const {setCols, values} = sqlForPartialUpdate(data, {})

        const idIndex = `$${values.length +1}`

        const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${idIndex}
        RETURNING id, title, salary, equity, company_handle
        `
        const result = await db.query(querySql, [...values, id])
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job id: ${id}`);

        return(job)
    }
    
    /**
     * Delete a record from the db corresponding to id passed as argument
     * Throws NotFoundError if job id does not exist
     * 
     * @param {*} id 
     * @returns {message: "Deleted"}
     */
    static async remove(id){

        const result = await db.query(`
        DELETE FROM jobs
        WHERE id = $1
        RETURNING id
        `, [id])

        const job = result.rows[0]

        if (!job){
            throw new NotFoundError(`No job found with id: ${id}`)
        }

        return({message: "Deleted"})
    }

    /**
     * Returns list of jobs associated with company handle passed as argument
     * Throws NotFoundError if job id does not exist
     * 
     * @param {*} handle 
     * @returns [{id, title, salary, equity, company_handle}, ...]
     */
    static async getCompany(handle){
        const result = await db.query(`
          SELECT id, title, salary, equity, company_handle
          FROM jobs
          WHERE company_handle = $1
        `,
        [handle])

        return result.rows
    }
}

module.exports = Job;