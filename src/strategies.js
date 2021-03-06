import { isArray } from "lodash";
import moment from "moment";

const infix = queryTerm => ({
  evaluate(searchText = "") {
    if (!searchText) {
      return false;
    }

    if (isArray(searchText)) {
      return searchText.some(v => this.evaluate(v));
    }

    return searchText.indexOf(queryTerm) !== -1;
  },
  matches(searchText = "") {
    if (!searchText) {
      return [];
    }

    if (isArray(searchText)) {
      return searchText.reduce((result, text, index) => {
        const search = this.matches(text);

        if (search.length) {
          result[index] = search; // eslint-disable-line no-param-reassign
        }

        return result;
      }, new Array(searchText.length));
    }

    const splitString = searchText.split(queryTerm);
    const result = [];
    let currentPosition = 0;

    for (let x = 0; x < splitString.length; x += 1) {
      result.push({
        startIndex: currentPosition + splitString[x].length,
        length: queryTerm.length
      });

      currentPosition += splitString[x].length + queryTerm.length;
    }

    result.pop();

    return result;
  }
});

const prefix = queryTerm => ({
  evaluate(searchText = "") {
    if (!searchText) {
      return false;
    }

    if (isArray(searchText)) {
      return searchText.some(v => this.evaluate(v));
    }

    return searchText.indexOf(queryTerm) === 0;
  },
  matches(searchText = "") {
    if (!searchText) {
      return [];
    }

    if (isArray(searchText)) {
      return searchText.reduce((result, text, index) => {
        const search = this.matches(text);

        if (search.length) {
          result[index] = search; // eslint-disable-line no-param-reassign
        }

        return result;
      }, new Array(searchText.length));
    }

    const prefixIndex = searchText.indexOf(queryTerm);

    if (prefixIndex === 0) {
      return [
        {
          startIndex: 0,
          length: queryTerm.length
        }
      ];
    }

    return [];
  }
});

const date = queryTerm => ({
  evaluate(searchText = "") {
    if (!searchText) {
      return false;
    }
    let result = true;
    if (queryTerm.min) {
      if (queryTerm.max) {
        result = moment(searchText).isSameOrAfter(queryTerm.min) && moment(searchText).isSameOrBefore(queryTerm.max);
      } else {
        result = moment(searchText).isSameOrAfter(queryTerm.min);
      }
    } else if (queryTerm.max) {
      result = moment(searchText).isSameOrBefore(queryTerm.max);
    }
    return result;
  },
  matches() {
    return [];
  }
});

const number = queryTerm => ({
  evaluate(searchText = "") {
    if (!searchText) {
      return false;
    }
    let result = true;
    if (queryTerm.min || queryTerm.min === 0) {
      if (queryTerm.max || queryTerm.max === 0) {
        result = searchText >= queryTerm.min && searchText <= queryTerm.max;
      } else {
        result = searchText >= queryTerm.min;
      }
    } else if (queryTerm.max || queryTerm.max === 0) {
      result = searchText <= queryTerm.max;
    }
    return result;
  },
  matches() {
    return [];
  }
});

const boolean = queryTerm => ({
  evaluate(searchText = false) {
    return queryTerm === searchText;
  },
  matches() {
    return [];
  }
});

export default {
  infix,
  prefix,
  date,
  number,
  boolean
};
