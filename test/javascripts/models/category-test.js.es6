import createStore from 'helpers/create-store';
import Category from 'discourse/models/category';

module("model:category");

test('slugFor', function(){
  const store = createStore();

  const slugFor = function(cat, val, text) {
    equal(Discourse.Category.slugFor(cat), val, text);
  };

  slugFor(store.createRecord('category', {slug: 'hello'}), "hello", "It calculates the proper slug for hello");
  slugFor(store.createRecord('category', {id: 123, slug: ''}), "123-category", "It returns id-category for empty strings");
  slugFor(store.createRecord('category', {id: 456}), "456-category", "It returns id-category for undefined slugs");
  slugFor(store.createRecord('category', {slug: '熱帶風暴畫眉'}), "熱帶風暴畫眉", "It can be non english characters");

  const parentCategory = store.createRecord('category', {id: 345, slug: 'darth'});
  slugFor(store.createRecord('category', {slug: 'luke', parentCategory: parentCategory}),
          "darth/luke",
          "it uses the parent slug before the child");

  slugFor(store.createRecord('category', {id: 555, parentCategory: parentCategory}),
          "darth/555-category",
          "it uses the parent slug before the child and then uses id");

  parentCategory.set('slug', null);
  slugFor(store.createRecord('category', {id: 555, parentCategory: parentCategory}),
        "345-category/555-category",
        "it uses the parent before the child and uses ids for both");
});


test('findBySlug', function() {
  expect(6);

  const store = createStore();
  const darth = store.createRecord('category', {id: 1, slug: 'darth'}),
    luke = store.createRecord('category', {id: 2, slug: 'luke', parentCategory: darth}),
    hurricane = store.createRecord('category', {id: 3, slug: '熱帶風暴畫眉'}),
    newsFeed = store.createRecord('category', {id: 4, slug: '뉴스피드', parentCategory: hurricane}),
    time = store.createRecord('category', {id: 5, slug: '时间', parentCategory: darth}),
    bah = store.createRecord('category', {id: 6, slug: 'bah', parentCategory: hurricane}),
    categoryList = [darth, luke, hurricane, newsFeed, time, bah];

  sandbox.stub(Discourse.Category, 'list').returns(categoryList);

  deepEqual(Discourse.Category.findBySlug('darth'), darth, 'we can find a category');
  deepEqual(Discourse.Category.findBySlug('luke', 'darth'), luke, 'we can find the other category with parent category');
  deepEqual(Discourse.Category.findBySlug('熱帶風暴畫眉'), hurricane, 'we can find a category with CJK slug');
  deepEqual(Discourse.Category.findBySlug('뉴스피드', '熱帶風暴畫眉'), newsFeed, 'we can find a category with CJK slug whose parent slug is also CJK');
  deepEqual(Discourse.Category.findBySlug('时间', 'darth'), time, 'we can find a category with CJK slug whose parent slug is english');
  deepEqual(Discourse.Category.findBySlug('bah', '熱帶風暴畫眉'), bah, 'we can find a category with english slug whose parent slug is CJK');

  sandbox.restore();
});

test('findSingleBySlug', function() {
  expect(6);

  const store = createStore();
  const darth = store.createRecord('category', {id: 1, slug: 'darth'}),
    luke = store.createRecord('category', {id: 2, slug: 'luke', parentCategory: darth}),
    hurricane = store.createRecord('category', {id: 3, slug: '熱帶風暴畫眉'}),
    newsFeed = store.createRecord('category', {id: 4, slug: '뉴스피드', parentCategory: hurricane}),
    time = store.createRecord('category', {id: 5, slug: '时间', parentCategory: darth}),
    bah = store.createRecord('category', {id: 6, slug: 'bah', parentCategory: hurricane}),
    categoryList = [darth, luke, hurricane, newsFeed, time, bah];

  sandbox.stub(Discourse.Category, 'list').returns(categoryList);

  deepEqual(Discourse.Category.findSingleBySlug('darth'), darth, 'we can find a category');
  deepEqual(Discourse.Category.findSingleBySlug('darth/luke'), luke, 'we can find the other category with parent category');
  deepEqual(Discourse.Category.findSingleBySlug('熱帶風暴畫眉'), hurricane, 'we can find a category with CJK slug');
  deepEqual(Discourse.Category.findSingleBySlug('熱帶風暴畫眉/뉴스피드'), newsFeed, 'we can find a category with CJK slug whose parent slug is also CJK');
  deepEqual(Discourse.Category.findSingleBySlug('darth/时间'), time, 'we can find a category with CJK slug whose parent slug is english');
  deepEqual(Discourse.Category.findSingleBySlug('熱帶風暴畫眉/bah'), bah, 'we can find a category with english slug whose parent slug is CJK');
});

test('findByIds', function() {
  const store = createStore();
  const categories =  {
    1: store.createRecord('category', {id: 1}),
    2: store.createRecord('category', {id: 2})
  };

  sandbox.stub(Discourse.Category, 'idMap').returns(categories);
  deepEqual(Discourse.Category.findByIds([1,2,3]), _.values(categories));
});

test('postCountStats', function() {
  const store = createStore();
  const category1 = store.createRecord('category', {id: 1, slug: 'unloved', posts_year: 2, posts_month: 0, posts_week: 0, posts_day: 0}),
      category2 = store.createRecord('category', {id: 2, slug: 'hasbeen', posts_year: 50, posts_month: 4, posts_week: 0, posts_day: 0}),
      category3 = store.createRecord('category', {id: 3, slug: 'solastweek', posts_year: 250, posts_month: 200, posts_week: 50, posts_day: 0}),
      category4 = store.createRecord('category', {id: 4, slug: 'hotstuff', posts_year: 500, posts_month: 280, posts_week: 100, posts_day: 22}),
      category5 = store.createRecord('category', {id: 6, slug: 'empty', posts_year: 0, posts_month: 0, posts_week: 0, posts_day: 0});

  let result = category1.get('postCountStats');
  equal(result.length, 1, "should only show year");
  equal(result[0].value, 2);
  equal(result[0].unit, 'year');

  result = category2.get('postCountStats');
  equal(result.length, 2, "should show month and year");
  equal(result[0].value, 4);
  equal(result[0].unit, 'month');
  equal(result[1].value, 50);
  equal(result[1].unit, 'year');

  result = category3.get('postCountStats');
  equal(result.length, 2, "should show week and month");
  equal(result[0].value, 50);
  equal(result[0].unit, 'week');
  equal(result[1].value, 200);
  equal(result[1].unit, 'month');

  result = category4.get('postCountStats');
  equal(result.length, 2, "should show day and week");
  equal(result[0].value, 22);
  equal(result[0].unit, 'day');
  equal(result[1].value, 100);
  equal(result[1].unit, 'week');

  result = category5.get('postCountStats');
  equal(result.length, 0, "should show nothing");
});

test('search', () => {
  const result = (term, opts) => {
    return Category.search(term, opts).map((category) => category.get('id'));
  };

  const store = createStore(),
        category1 = store.createRecord('category', { id: 1, name: 'middle term' }),
        category2 = store.createRecord('category', { id: 2, name: 'middle term' });

  sandbox.stub(Category, "listByActivity").returns([category1, category2]);

  deepEqual(result('term', { limit: 0 }), [], "returns an empty array when limit is 0");
  deepEqual(result(''), [category1.get('id'), category2.get('id')], "orders by activity if no term is matched");
  deepEqual(result('term'), [category1.get('id'), category2.get('id')], "orders by activity");

  category2.set('name', 'TeRm start');
  deepEqual(result('tErM'), [category2.get('id'), category1.get('id')], "ignores case of category name and search term");

  category2.set('name', 'term start');
  deepEqual(result('term'), [category2.get('id'), category1.get('id')], "orders matching begin with and then contains");

  sandbox.restore();

  const category3 = store.createRecord('category', { id: 3, name: 'term start', parent_category_id: category1.get('id') }),
        category4 = store.createRecord('category', { id: 4, name: 'some term', read_restricted: true });

  sandbox.stub(Category, "listByActivity").returns([category4, category1, category3, category2]);

  deepEqual(result(''),
            [category1.get('id'), category3.get('id'), category2.get('id'), category4.get('id')],
            "prioritize non read_restricted categories when term is blank");

  deepEqual(result('', { limit: 3 }),
            [category1.get('id'), category3.get('id'), category4.get('id')],
            "prioritize non read_restricted categories when term is blank with limit");

  deepEqual(result('term'),
            [category3.get('id'), category2.get('id'), category1.get('id'), category4.get('id')],
            "prioritize non read_restricted");

  deepEqual(result('term', { limit: 3 }),
            [category3.get('id'), category2.get('id'), category4.get('id')],
            "prioritize non read_restricted with limit");

  sandbox.restore();
});
