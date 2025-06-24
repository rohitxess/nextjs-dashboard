'use server';
import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache'; // to clear the cache and trigger a new request 
import { redirect } from 'next/navigation';

const sql =  postgres(process.env.POSTGRES_URL!, { ssl: 'require'})

//zod validation for validating the entries from the form 

const FormSchema = z.object({
    id: z.string(), 
    customerId: z.string({
      invalid_type_error: 'Please select a customer',
    }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0'}),
    status: z.enum(['pending', 'paid'], {
      invalid_type_error: 'Please select an invoice status',
    }),
    date: z.string()
});

const CreateInvoice = FormSchema.omit({id: true, date: true})

// extracting all the values of formdata

// ...
// function for creating invoice 

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    // validating the form fields using zod 
    const validateFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    // if form validation fails, return errors early, otherwise continue 

    if (!validateFields.success){
      return {
        errors: validateFields.error.flatten().fieldErrors, 
        message: 'Missing fields. Failed to create invoice'
      }
    }

    // prepare the data for insertion into the database

    const {customerId, amount, status } = validateFields.data;
  
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

  export async function updateInvoice(id: string, prevState: State, formData: FormData){
    
    // extract the data from formData
    // validating the types with zod 
    // converting the amount to cents 
    // passing the valriables to your SQL query
    // calling revalidatePath to clear the client cache and make a server request
    // callig redirect to redirect the user to the invoice's page 

    const validateFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    })

    // if form validates then parse in the database

    if (!validateFields.success){
      return {
        errors: validateFields.error.flatten().fieldErrors, 
        message: 'Missing fields. Failed to create invoice'
      }
    }


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

