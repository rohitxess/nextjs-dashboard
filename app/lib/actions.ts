'use server';
import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache'; // to clear the cache and trigger a new request 
import { redirect } from 'next/navigation';

const sql =  postgres(process.env.POSTGRES_URL!, { ssl: 'require'})

//zod validation for validating the entries from the form 

const FormSchema = z.object({
    id: z.string(), 
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
});

const CreateInvoice = FormSchema.omit({id: true, date: true})

// extracting all the values of formdata

// ...
// function for creating invoice 
export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    // storing the money in cents 

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // inserting the data into the database
    try{
      await sql `
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date} )
      `
    }catch(err){
      console.log(err)
    }
   

    revalidatePath('/dashboard/invoices');  // the data will be revalidated 
    redirect('/dashboard/invoices')
  }

  // function for updating invoice 
  const UpdateInvoice = FormSchema.omit({id: true, date: true})

  export async function updateInvoice(id: string, formData: FormData){
    
    // extract the data from formData
    // validating the types with zod 
    // converting the amount to cents 
    // passing the valriables to your SQL query
    // calling revalidatePath to clear the client cache and make a server request
    // callig redirect to redirect the user to the invoice's page 


    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    })

    const amountInCents = amount * 100;

    //query for updating sql 
    try{
      await sql `
      UPDATE invoices
      SET customer_Id = ${customerId},
      amount = ${amountInCents},
      status = ${status}
      WHERE id = ${id}
      `;
    }catch(err){
      console.log(err)
    }

    revalidatePath('/dashboard/invoices');  
    redirect('/dashboard/invoices')

  }

  // function to delete the invoice 

  export async function deleteInvoice(id: string){
    throw new Error('Failed to delete invoice');
    await sql `
    DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');  
  }