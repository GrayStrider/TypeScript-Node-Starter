import { Recipe } from './recipe-type'
import { Field, InputType } from 'type-graphql'

@InputType()
export class RecipeInput implements Partial<Recipe> {
  @Field()
  title: string

  @Field({ nullable: true })
  description?: string
}
