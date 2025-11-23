import { supabase } from '../supabase';

describe('supabase client', () => {
  it('should export supabase instance', () => {
    expect(supabase).toBeDefined();
  });

  it('should have from method', () => {
    expect(typeof supabase.from).toBe('function');
  });

  it('should have query builder methods', () => {
    const builder = supabase.from('test_table');
    expect(builder).toBeDefined();
    expect(typeof builder.select).toBe('function');
    expect(typeof builder.insert).toBe('function');
    expect(typeof builder.update).toBe('function');
  });

  it('should support chaining operations', () => {
    const builder = supabase.from('test_table');
    const result = builder.select('*').eq('id', '1');
    expect(result).toBeDefined();
    expect(typeof result.then).toBe('function');
  });

  it('should support various table names', () => {
    const tables = ['tasks', 'bids', 'users', 'payments'];
    tables.forEach(table => {
      const builder = supabase.from(table);
      expect(builder).toBeDefined();
    });
  });

  it('should support delete operations', () => {
    const builder = supabase.from('tasks');
    expect(typeof builder.delete).toBe('function');
  });

  it('should support select with specific columns', () => {
    const builder = supabase.from('tasks').select('id,title');
    expect(builder).toBeDefined();
  });

  it('should support insert operations', () => {
    const builder = supabase.from('tasks');
    const insertBuilder = builder.insert({ title: 'Test' });
    expect(insertBuilder).toBeDefined();
  });

  it('should support update operations', () => {
    const builder = supabase.from('tasks');
    const updateBuilder = builder.update({ status: 'completed' });
    expect(updateBuilder).toBeDefined();
  });

  it('should support filter operations', () => {
    const builder = supabase
      .from('tasks')
      .select('*')
      .eq('status', 'open')
      .neq('agent_wallet', null);
    expect(builder).toBeDefined();
  });

  it('should support ordering operations', () => {
    const builder = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    expect(builder).toBeDefined();
  });

  it('should support limit operations', () => {
    const builder = supabase
      .from('tasks')
      .select('*')
      .limit(10);
    expect(builder).toBeDefined();
  });

  it('should support range operations', () => {
    const builder = supabase
      .from('tasks')
      .select('*')
      .range(0, 9);
    expect(builder).toBeDefined();
  });

  it('should support single row operations', () => {
    const builder = supabase
      .from('tasks')
      .select('*')
      .eq('id', '1')
      .single();
    expect(builder).toBeDefined();
  });
});
