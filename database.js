const supabase = require('./supabaseClient');
const crypto = require('crypto');

async function initDatabase() {
  try {
    const { error } = await supabase.from('subscribers').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    console.log('Connected to Supabase database');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

async function addSubscriber(email, name = null) {
  const unsubscribeToken = crypto.randomBytes(32).toString('hex');

  const { data, error } = await supabase
    .from('subscribers')
    .insert([
      {
        email,
        name,
        unsubscribe_token: unsubscribeToken
      }
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Email already subscribed');
    }
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    unsubscribeToken: data.unsubscribe_token
  };
}

async function getActiveSubscribers() {
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

async function unsubscribe(token) {
  const { data, error } = await supabase
    .from('subscribers')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .select();

  if (error) {
    throw error;
  }

  return data && data.length > 0;
}

async function saveDeal(deal) {
  const { data, error } = await supabase
    .from('deals')
    .insert([
      {
        business_name: deal.businessName,
        title: deal.title,
        description: deal.description,
        discount: deal.discount,
        valid_until: deal.validUntil,
        source_url: deal.sourceUrl,
        category: deal.category,
        location: deal.location
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function markDealAsSent(dealId) {
  const { data, error } = await supabase
    .from('deals')
    .update({ sent_at: new Date().toISOString() })
    .eq('id', dealId)
    .select();

  if (error) {
    throw error;
  }

  return data && data.length > 0;
}

module.exports = {
  initDatabase,
  addSubscriber,
  getActiveSubscribers,
  unsubscribe,
  saveDeal,
  markDealAsSent
};
