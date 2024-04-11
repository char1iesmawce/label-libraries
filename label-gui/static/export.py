import json
import argparse
from MajorTypes import majortypes


def main():
    parser = argparse.ArgumentParser(description='Export major types')
    parser.add_argument('-o', '--output', required=False, help="Outpath", default=None)
    args = parser.parse_args()
    if args.output is not None:
        with open(args.output , 'w') as f:
            json.dump(majortypes, f)
    else:
        print(json.dumps(majortypes, indent=4))

if __name__ == '__main__':
    main()
