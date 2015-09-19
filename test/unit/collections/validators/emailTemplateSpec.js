import {expect} from 'chai';

import {templateValidator} from 'collections/validators/emailTemplate';

describe('Email template valiator', function() {
  let name = 'name';
  let language = 'en-UK';

  it('invalid data', function() {
    expect(templateValidator()).to.be.false;
    expect(templateValidator({ name })).to.be.false;
    expect(templateValidator({ language })).to.be.false;
  });

  it('valid data', function() {
    expect(templateValidator({ name, language })).to.be.true;
    
  });
});
