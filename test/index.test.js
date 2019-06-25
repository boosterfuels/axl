'use strict'

const Stream = require('../')
const assert = require('assert')

describe('Stream', function() {
  it('subscribe', function() {
    const stream = new Stream()

    let vals = []
    stream.subscribe({
      next: v => vals.push(v)
    })

    stream.next('foo')
    assert.deepEqual(vals, ['foo'])
  })

  it('filter', function() {
    const stream = new Stream()

    let vals = []
    stream
      .filter(v => v >= 0)
      .subscribe({
        next: v => vals.push(v)
      })

    stream.next(-1)
    stream.next(1)
    stream.next(-1)
    assert.deepEqual(vals, [1])
  })

  it('map', function() {
    const stream = new Stream()

    let vals = []
    stream
      .map(v => v % 2)
      .subscribe({
        next: v => vals.push(v)
      })

    stream.next(1)
    stream.next(2)
    stream.next(3)
    stream.next(4)
    assert.deepEqual(vals, [1, 0, 1, 0])
  })

  it('merge', function() {
    const s1 = new Stream()
    const s2 = new Stream()
    const stream = Stream.merge(s1, s2)

    let vals = []
    stream.subscribe({
      next: v => vals.push(v)
    })

    s1.next(1)
    s2.next(2)
    s1.next(3)
    s2.next(4)
    assert.deepEqual(vals, [1, 2, 3, 4])
  })

  it('unsubscribe', function() {
    const stream = new Stream()

    let vals = []
    const unsubscribe = stream.subscribe({
      next: v => vals.push(v)
    })

    stream.next('foo')
    assert.deepEqual(vals, ['foo'])

    unsubscribe()

    stream.next('bar')
    assert.deepEqual(vals, ['foo'])
  })

  describe('errors', function() {
    it('calls error handler', function() {
      const stream = new Stream()

      let errs = []
      stream.subscribe({
        next: () => {},
        error: err => errs.push(err)
      })

      stream.error(new Error('Oops'))

      assert.deepEqual(errs.map(e => e.message), ['Oops'])
    })

    it('errors bubble through filter()', function() {
      const stream = new Stream()

      let errs = []
      stream
        .filter(() => false)
        .subscribe({
          error: err => errs.push(err)
        })

      stream.error(new Error('Oops'))

      assert.deepEqual(errs.map(e => e.message), ['Oops'])
    })

    it('emits error if filter() throws', function() {
      const stream = new Stream()

      let errs = []
      stream
        .filter(() => { throw new Error('Oops') })
        .subscribe({
          error: err => errs.push(err)
        })

      stream.next('test')
      assert.deepEqual(errs.map(e => e.message), ['Oops'])
    })
  })

  it('throws if subscribe() gets a function param', function() {
    assert.throws(() => {
      new Stream().subscribe(v => v)
    }, /must be an object/)
  })
});