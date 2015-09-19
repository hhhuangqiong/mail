import {expect} from 'chai';

import {metaValidator} from 'collections/validators/emailMeta';

describe('Email meta valiator', function() {
  let from = 'from';
  let to = 'to';
  let subject = 'subject';

  it('invalid data', function() {
    expect(metaValidator()).to.be.false;
    expect(metaValidator({from})).to.be.false;
    expect(metaValidator({from, to})).to.be.false;
    expect(metaValidator({subject, to})).to.be.false;
  });

  it('valid data', function() {
    expect(metaValidator({ from, to, subject })).to.be.true;
    
  });
});
