interface JsonifyFunc{
  (): unknown
}

interface IJsonable{
  jsonify: JsonifyFunc
}

export default abstract class Jsonable implements IJsonable{
  jsonify(): JsonifyFunc {
    return JSON.parse(JSON.stringify(this))
  }
}